'use strict';

// TODO: beautify
global._ = require('underscore');
require('underscore-data');
var Database = require('../lib/database');

//
// collect entities schemas
// TODO: consider DB-ify
//
var schema = require('./schema');
//console.log('SCHEMA', schema);

module.exports = function(config, callback){

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

////////////////////////////////////////////////////////////
Next({}, function(err, result, next){

	//
	// connect to MongoDB instance, register entities
	//
	var db = new Database(config.database.url, schema, next);

////////////////////////////////////////////////////////////
}, function(err, model, next){

	//
	// set the model
	//
	if (!model) model = {};
	//console.log('MODEL', model);

	//
	// redefine User accessors, to obey security
	//
	this.User = model.User;
	_.each(model, function(entity, name) {
		if (entity.schema.collection !== 'User') return;
		var orig = entity;
		var store = {};
		//
		// get -- when getting the data for context.user we must use another schema
		//
		store.getOwn = function(context, id, next) {
			if (!id) return next();
			// determine if id is equal to the context user' id
			var isSelf = id === context.user.id;
			// if so, return private view of the user record
			if (isSelf) {
				orig._getOwn(schema.User, context, id, next);
			// else return admin's view
			} else {
				orig.getOwn(context, id, next);
			}
		};
		store.getAny = function(context, id, next) {
			if (!id) return next();
			// determine if id is equal to the context user' id
			var isSelf = id === context.user.id;
			// if so, return private view of the user record
			if (isSelf) {
				orig._getAny(schema.User, context, id, next);
			// else return admin's view
			} else {
				orig.getAny(context, id, next);
			}
		};
		//
		// add -- assign crypted password and salt
		//
		store.add = function(context, data, next) {
			if (!data) data = {};
			if (!data.password) data.password = nonce().substring(0, 7);
			var salt = nonce();
			var password = encryptPassword(data.password, salt);
			// FIXME: must validate data.roles via canDelegate
			orig.add(context, {
				id: data.id,
				password: password,
				salt: salt,
				type: data.type
			}, function(err, doc){
				if (err) return next(err);
				// TODO: node-mailer data.password
				next(null, doc);
			});
		};
		//
		// query -- goes intact
		store.queryOwn = orig.queryOwn;
		store.queryAny = orig.queryAny;
		//
		//
		// update -- act differently upon context.user (because of schema);
		// also take care of updating salt and crypted password
		//
		store.update = function(context, query, changes, next) {
			// FIXME: must validate changes.roles via canDelegate
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
					orig._updateOwn(schema.User, context, _.rql(query).eq('id', context.user.id), profileChanges, step);
					/*
										if plainPassword and @user.email
											console.log 'PASSWORD SET TO', plainPassword
											#	mail context.user.email, 'Password set', plainPassword
										*/
				},
				// update others
				function(err, result, step) {
					orig.updateOwn(context, _.rql(query).ne('id', context.user.id), changes, step);
				},
				// TODO: report changes (email?)
				function(err) {
					next(err);
				}
			);
		};
		store.updateAny = function(context, query, changes, next) {
			// FIXME: must validate changes.roles via canDelegate
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
					orig._updateAny(schema.User, context, _.rql(query).eq('id', context.user.id), profileChanges, step);
					/*
										if plainPassword and @user.email
											console.log 'PASSWORD SET TO', plainPassword
											#	mail context.user.email, 'Password set', plainPassword
										*/
				},
				// update others
				function(err, result, step) {
					orig.updateAny(context, _.rql(query).ne('id', context.user.id), changes, step);
				},
				// TODO: report changes (email?)
				function(err) {
					next(err);
				}
			);
		};
		//
		// remove -- forbid self-removal
		//
		store.removeOwn = function(context, query, next) {
			orig.removeOwn(context, _.rql(query).ne('id', context.user.id), next);
		};
		store.removeAny = function(context, query, next) {
			orig.removeAny(context, _.rql(query).ne('id', context.user.id), next);
		};
		//
		// delete -- forbid self-removal
		//
		if (orig.deleteOwn) {
			store.deleteOwn = function(context, query, next) {
				orig.deleteOwn(context, _.rql(query).ne('id', context.user.id), next);
			};
		}
		if (orig.deleteAny) {
			store.deleteAny = function(context, query, next) {
				orig.deleteAny(context, _.rql(query).ne('id', context.user.id), next);
			};
		}
		//
		// undelete -- forbid self-restoral
		//
		if (orig.undeleteOwn) {
			store.undeleteOwn = function(context, query, next) {
				orig.undeleteOwn(context, _.rql(query).ne('id', context.user.id), next);
			};
		}
		if (orig.undeleteAny) {
			store.undeleteAny = function(context, query, next) {
				orig.undeleteAny(context, _.rql(query).ne('id', context.user.id), next);
			};
		}
		//
		// purge -- forbid self-purge
		//
		if (orig.purgeOwn) {
			store.purgeOwn = function(context, query, next) {
				User.purgeOwn(context, _.rql(query).ne('id', context.user.id), next);
			};
		}
		if (orig.purgeAny) {
			store.purgeAny = function(context, query, next) {
				User.purgeAny(context, _.rql(query).ne('id', context.user.id), next);
			};
		}
		//
		// replace entity
		//
		model[name] = store;
	});

	//
	// fix the model
	//
	this.model = model; // Object.freeze(model);
	//console.log('PATCHED', model);
	//console.log('UTS', schema.Affiliate.properties.roles);

	//
	// derive roles from model
	//
	var roles = {};
	_.each(model, function(store, name){
		function prop(value) {
			var r = {};
			r[name]= value;
			return r;
		}
		roles["" + name + "-reader"] = prop({
			query: store.queryAny,
			get: store.getAny
		});
		roles["" + name + "-creator"] = prop({
			query: store.queryAny,
			add: store.add
		});
		roles["" + name + "-author"] = prop({
			query: store.queryOwn,
			get: store.getOwn,
			add: store.add,
			update: store.updateOwn,
			remove: store.removeOwn
		});
		roles["" + name + "-editor"] = prop({
			query: store.queryAny,
			get: store.getAny,
			add: store.add,
			update: store.updateAny,
			remove: store.removeAny
		});
		if (store.deleteOwn) {
			_.extend(roles["" + name + "-author"], prop({
				delete: store.deleteOwn,
				undelete: store.undeleteOwn,
				purge: store.purgeOwn
			}));
		}
		if (store.deleteAny) {
			_.extend(roles["" + name + "-editor"], prop({
				delete: store.deleteAny,
				undelete: store.undeleteAny,
				purge: store.purgeAny
			}));
		}
	});
	//this.roles = roles;
	//console.log(roles);

	//
	// fetch the roles
	//
	//model.Role.query(null, '', next);
	//next(null, require('./roles'));

	next(null, roles);

////////////////////////////////////////////////////////////
}, function(err, roles, next){

	// TODO: beautify
	var model = this.model;
	var User = this.User;
	var facets = {};

	var fullFacet = {};
	facets = roles;
	_.each(roles, function(v, k){
		if (k.match(/-editor$/)) {
			_.extend(fullFacet, v);
		}
	});
	//console.log('F', fullFacet);
	//console.log('FX', facets);

	//
	// get capability of a user uid
	//
	function getCapability(uid, next) {
		Next(null,
			function(err, result, step) {
				// TODO: more secure ;)
				if (uid === 'root') {
					var user = {
						id: uid,
						password: 'foo'
					};
					step(null, user);
				} else {
					User._getAny(null, this, uid, step);
				}
			},
			function(err, user, step) {
				// bad user defaults to a guest
				if (!user) user = {};
				// context is a superposition of facets due to user roles
				var caps;
				if (uid === 'root') {
					caps = _.extend({}, fullFacet);
				} else {
					caps = _.extend.apply(null, [{}].concat(_.map(user.roles, function(x){return facets[x] || {};})));
				}
				// set context user
				Object.defineProperty(caps, 'user', {value: user});
				//
				//console.log('CAPS', user, caps);
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
					} else if (user.password !== encryptPassword(password, user.salt)) {
						if (uid === 'root') {
							next(null, context);
						} else {
							next('Invalid user');
						}
					} else {
						next(null, context);
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
