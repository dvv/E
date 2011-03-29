'use strict';

// TODO: beautify
global._ = require('underscore');
require('underscore-data');
var Database = require('../lib/database');

//
// secrets helpers
//
var Crypto = require('crypto');
function nonce() {
	return (Date.now() & 0x7fff).toString(36) + Math.floor(Math.random() * 1e9).toString(36) + Math.floor(Math.random() * 1e9).toString(36) + Math.floor(Math.random() * 1e9).toString(36);
};
function sha1(data, key) {
	var hmac = Crypto.createHmac('sha1', '');
	hmac.update(data);
	return hmac.digest('hex');
};
function encryptPassword(password, salt) {
	return sha1(salt + password + config.security.secret);
};

//
// collect entities schemas
// TODO: consider DB-ify
//
var schema = require('./schema');
//console.log('SCHEMA', schema);

module.exports = function(config, callback){

////////////////////////////////////////////////////////////
Next({}, function(err, result, next){

	//
	// connect to MongoDB instance, register entities
	//
	var db = new Database('', schema, next);

////////////////////////////////////////////////////////////
}, function(err, model, next){

	//
	// set the model
	//
	if (!model) model = {};

	//
	// redefine User accessors, to obey security
	//
	var User = model.User;
	model.User = {
		//
		// get -- special cases are:
		// 1. getting the root, because it's not in DB
		// 2. getting the context.user, because we must use another schema
		//
		get: function(context, id, next) {
			if (!id) return next();
			// determine if id is equal to the context user' id
			var isSelf = id === context.user.id;
			// if so, return private view of the user record
			if (isSelf) {
				User._get(schema.UserSelf, context, id, next);
			// else return admin's view
			} else {
				User.get(context, id, next);
			}
		},
		//
		// query -- goes intact
		//
		query: function(context, query, next) {
			User.query(context, query, next);
		},
		//
		// add -- assign crypted password and salt
		//
		add: function(context, data, next) {
			if (!data) data = {};
			Next(context,
				function(err, result, step) {
					if (!data.password) data.password = nonce().substring(0, 7);
					var salt = nonce();
					var password = encryptPassword(data.password, salt);
					User.add(context, {
						id: data.id,
						password: password,
						salt: salt,
						type: data.type
					}, step);
				},
				function(err, user) {
					if (err) return next(err);
					if (user.email) {
						// TODO: node-mailer?
						console.log('PASSWORD SET TO', data.password);
					}
					next(null, user);
				}
			);
		},
		//
		// update -- act differently upon context.user (because of schema);
		// also take care of updating salt and crypted password
		//
		update: function(context, query, changes, next) {
			// FIXME: mush validate changes.roles -- canDelegate
			var plainPassword;
			Next(context,
				// update self
				function(err, result, step) {
					var profileChanges = _.clone(changes);
					if (profileChanges.password) {
						plainPassword = String(profileChanges.password);
						profileChanges.salt = nonce();
						profileChanges.password = encryptPassword(plainPassword, profileChanges.salt);
					}
					User._update(model.UserSelf.schema, context, _.rql(query).eq('id', context.user.id), profileChanges, step);
					/*
										if plainPassword and @user.email
											console.log 'PASSWORD SET TO', plainPassword
											#	mail context.user.email, 'Password set', plainPassword
										*/
				},
				// update others
				function(err, result, step) {
					User.update(context, _.rql(query).ne('id', context.user.id), changes, step);
				},
				// TODO: report changes (email?)
				function(err) {
					next(err);
				}
			);
		},
		//
		// remove -- forbid self-removal
		//
		remove: function(context, query, next) {
			User.remove(context, _.rql(query).ne('id', context.user.id), next);
		},
		//
		// delete -- forbid self-removal
		//
		delete: function(context, query, next) {
			User.delete(context, _.rql(query).ne('id', context.user.id), next);
		},
		//
		// undelete -- forbid self-restoral
		//
		undelete: function(context, query, next) {
			User.undelete(context, _.rql(query).ne('id', context.user.id), next);
		},
		//
		// purge -- forbid self-purge
		//
		purge: function(context, query, next) {
			User.purge(context, _.rql(query).ne('id', context.user.id), next);
		}
	};

	//
	// User types: redefine conditions to constrain queries to a certain user type
	//
	_.each(config.userTypes, function(name, type) {
		// N.B. we constrain accessors to act upon only owned objects of certain type
		model[name] = {
			query: function(context, query, next) {
				model.User.query(context, User.owned(context, query).eq('type', type), next);
			},
			get: function(context, id, next) {
				var query = User.owned(context, 'limit(1)').eq('type', type).eq('id', id);
				model.User.query(context, query, function(err, result) {
					next(err, result[0] || null);
				});
			},
			add: function(context, data, next) {
				if (data == null) data = {};
				data.type = type;
				model.User.add(context, data, next);
			},
			update: function(context, query, changes, next) {
				model.User.update(context, User.owned(context, query).eq('type', type), changes, next);
			},
			remove: function(context, query, next) {
				model.User.remove(context, User.owned(context, query).eq('type', type), next);
			},
			delete: function(context, query, next) {
				model.User.delete(context, User.owned(context, query).eq('type', type), next);
			},
			undelete: function(context, query, next) {
				model.User.undelete(context, User.owned(context, query).eq('type', type), next);
			},
			purge: function(context, query, next) {
				model.User.purge(context, User.owned(context, query).eq('type', type), next);
			}
		};
		// mimick Database.register logic
		Object.defineProperties(model[name], {
			id: {value: name},
			schema: {value: User.schema}
		});
	});

	//
	// fix the model
	//
	this.model = model; // Object.freeze(model);

	//
	// fetch the roles
	//
	//model.Role.query(null, '', next);
	next(null, require('./roles'));

////////////////////////////////////////////////////////////
}, function(err, roles, next){

	// TODO: beautify
	var model = this.model;
	var facets = {};

	//
	// map roles to facets
	//
	// N.B. this should be called whenever roles are changed
	//

	function expand(roleNames){
		var res = [];
		_.each(_.select(roles, function(x){return ~roleNames.indexOf(x.id);}), function(role){
			//console.log(role);
			if (role.roles) {
				var subs = expand(role.roles);
				res.push.apply(res, subs);
			}
			res.push(role);
		});
		return res;
	}

	function caps(roleNames, justNames){
		var roles = _.unique(expand(roleNames), function(x){return x.id});
		if (justNames) roles = _.map(roles, function(x){return x.id});
		return roles;
	}

	//this.model.User.canDelegate = 
	function canDelegate(hasRoleNames, roleNames){
		var hasRoles = caps(hasRoleNames, true);
		return _.intersect(hasRoles, roleNames);
	}

	_.each(_.map(roles, function(x){return x.id}), function(id){
		var facet = facets[id] = {};
		_.each(caps([id]), function(role){
			//console.log('FACET', id, role);
			var obj = model[role.entity];
			if (!obj) return;
			if (!facet.hasOwnProperty(role.entity)) facet[role.entity] = {};
			_.each(role.methods, function(definition){
				var name, prop;
				//console.log('DEF', definition);
				if (Array.isArray(definition)) {
					name = definition[1];
					prop = definition[0];
					if (typeof prop != 'function' || prop.prototype.match) {
						prop = _.get(obj, prop);
					}
				} else {
					name = definition;
					prop = obj[name];
				}
				if (prop) {
					Object.defineProperty(facet[role.entity], name, {value: prop, enumerable: true});
				}
			});
		});
	});

	//
	// get capability of a user uid
	//
	function getCapability(uid, next) {
		Next(null,
			function(err, result, step) {
				User._get(null, this, uid, step);
			},
			function(err, user, step) {
				// get the user level
				var level;
				// bad user defaults to a guest
				if (!user) user = {};
				// context is a superposition of facets due to user roles
				var caps = _.extend.apply(null, [{}].concat(_.map(user.roles, function(x){return facets[x] || {};})));
				// set context user
				Object.defineProperty(caps, 'user', {value: user});
				//
				next(null, caps);
			}
		);
	}

	//
	// verify provided credentials, return the user context
	//
	function checkCredentials(uid, password, next) {
		Next(null,
			function(err, result, step) {
				getCapability(uid, step);
			},
			function(err, context) {
				var user = context.user;
				if (!user.id) {
					next();
				} else {
					if (!user.password || user.blocked) {
						next('User blocked');
					} else if (user.password === encryptPassword(password, user.salt)) {
						next(null, context);
					} else {
						next('Invalid user');
					}
				}
			}
		);
	}

	//
	// return security provider
	//
	callback(null, {
		getCapability: getCapability,
		checkCredentials: checkCredentials
	});
});

};
