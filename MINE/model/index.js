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

module.exports = function(config, callback) {

//
// secrets helpers
//
var Crypto = require('crypto');
function nonce() {
	return (Date.now() & 0x7fff).toString(36) + Math.floor(Math.random() * 1e9).toString(36) + Math.floor(Math.random() * 1e9).toString(36) + Math.floor(Math.random() * 1e9).toString(36);
}
function sha1(data, key) {
	var hmac = Crypto.createHmac('sha1', '');
	hmac.update(data);
	return hmac.digest('hex');
}
function encryptPassword(password, salt) {
	return sha1(salt + password + config.security.secret);
}

////////////////////////////////////////////////////////////
Next({}, function(err, result, next) {

	//
	// connect to MongoDB instance, register entities
	//
	var db = new Database(config.database.url, schema, next);

////////////////////////////////////////////////////////////
}, function(err, model, next) {

	//
	// set the model
	//
	if (!model) model = {};
	//console.log('MODEL', model);

	//
	// redefine User accessors, to obey security
	//
	var User = model.User;
	var Admin = model.Admin;
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
			if (!data.password) {
				//data.password = nonce().substring(0, 7);
				return next('Need password');
			}
			if (!data.email) return next('Need email');
			var salt = nonce();
			var password = encryptPassword(data.password, salt);
			Next(null, function(err, result, step) {
				// the very first user of type 'admin' becomes the root
				// N.B. typically at bootstrap you need to enable config.security.bypass,
				// create the first admin user by PUTting to /Admin/_new, and
				// redisable config.security.bypass
				User.queryAny(context, 'type=admin&select(id,roles)&limit(1)', step);
			}, function(err, admins, step) {
				//console.log('ADMINS', arguments);
				if (err) return next(err);
				// if no admins so far -> the very first user being added will be the root
				if (!admins.length) {
					// if no context provided -> self-registration is meant,
					// context should mention root's id and full roles
					if (!context) context = {user: {id: nonce()+nonce()+nonce(), roles: fullRole}};
					// add admin user
					Admin.add(context, {
						id: data.id,
						email: data.email,
						password: password,
						salt: salt,
						roles: fullRole,
						status: 'approved'
					}, step);
					return;
				// if no context provided -> self-registration is meant,
				// context should mention root's id
				} else if (!context) {
					context = {user: admins[0]};
					// use default role
					delete data.roles;
					// use default status
					delete data.status;
				// authorized user creates new user
				} else {
					// set status to 'approved'
					data.status = 'approved';
				}
				console.log('ADD?', data, context, password);
				// add typed user
				orig.add(context, {
					id: data.id,
					email: data.email,
					password: password,
					salt: salt,
					type: data.type,
					roles: data.roles,
					status: data.status
				}, step);
			}, function(err, user, step) {
				console.log('USERADDED', err, user);
				if (err) return next(err);
				// TODO: node-mailer data.id, data.password
				next(null, user);
			});
		};
		//
		// query -- goes intact
		//
		store.queryOwn = orig.queryOwn;
		store.queryAny = orig.queryAny;
		//
		//
		// update -- act differently upon context.user (because of schema);
		// also take care of updating salt and crypted password
		//
		store.updateOwn = function(context, query, changes, next) {
			Next(context, function(err, result, step) {
				// update self
				var profileChanges = _.clone(changes);
				if (profileChanges.password) {
					var plainPassword = String(profileChanges.password);
					profileChanges.salt = nonce();
					profileChanges.password = encryptPassword(plainPassword, profileChanges.salt);
				}
				orig._updateOwn(schema.User, context, _.rql(query).eq('id', context.user.id), profileChanges, step);
				/*
									if plainPassword and context.user.email
										console.log 'PASSWORD SET TO', plainPassword
										#	mail context.user.email, 'Password set', plainPassword
									*/
			}, function(err, result, step) {
				// TODO: report changes (email?)
				step();
			}, function(err, result, step) {
				// update others
				orig.updateOwn(context, _.rql(query).ne('id', context.user.id), changes, step);
			}, function(err) {
				next(err);
			});
		};
		store.updateAny = function(context, query, changes, next) {
			Next(context, function(err, result, step) {
				// update self
				var profileChanges = _.clone(changes);
				if (profileChanges.password) {
					var plainPassword = String(profileChanges.password);
					profileChanges.salt = nonce();
					profileChanges.password = encryptPassword(plainPassword, profileChanges.salt);
				}
				orig._updateAny(schema.User, context, _.rql(query).eq('id', context.user.id), profileChanges, step);
			}, function(err, result, step) {
				// TODO: report changes (email?)
				step();
			}, function(err, result, step) {
				// update others
				orig.updateAny(context, _.rql(query).ne('id', context.user.id), changes, step);
			}, function(err) {
				next(err);
			});
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
		// ???
		//
		store.foo = function(context, params, next) {
			console.log('User.foo(' + JSON.stringify(params) + ') called!');
			next();
		}
		//
		// replace the entity
		//
		model[name] = store;
	});

	// N.B. there's no exposed User model
	delete model.User;

	//
	// derive standard roles from model
	//
	var roles = {};
	_.each(model, function(store, name){
		function prop(value) {
			var r = {};
			r[name]= value;
			return r;
		}
		roles['' + name + '-viewer'] = prop({
			query: store.queryAny
		});
		roles['' + name + '-reader'] = prop({
			query: store.queryAny,
			get: store.getAny
		});
		roles['' + name + '-creator'] = prop({
			query: store.queryAny,
			add: store.add
		});
		roles['' + name + '-author'] = prop({
			query: store.queryOwn,
			get: store.getOwn,
			add: store.add,
			update: store.updateOwn,
			remove: store.removeOwn
		});
		roles['' + name + '-editor'] = prop({
			query: store.queryAny,
			get: store.getAny,
			add: store.add,
			update: store.updateAny,
			remove: store.removeAny,
			foo: store.foo
		});
		if (store.deleteOwn) {
			_.extend(roles['' + name + '-author'], prop({
				delete: store.deleteOwn,
				undelete: store.undeleteOwn,
				purge: store.purgeOwn
			}));
		}
		if (store.deleteAny) {
			_.extend(roles['' + name + '-editor'], prop({
				delete: store.deleteAny,
				undelete: store.undeleteAny,
				purge: store.purgeAny
			}));
		}
	});
	//this.roles = roles;
	//console.log(roles);

	//
	// fetch custom roles
	//
	//model.Role.query(null, '', next);
	//next(null, require('./roles'));

	// collect the full access role
	var fullRole = [];
	_.each(roles, function(role, name){
		if (name.match(/-editor$/)) fullRole.push(name);
	});

	//
	// get capability of a user uid
	//
	function getCapability(uid, callback) {
		Next(null, function(err, result, next) {
			User._getAny(null, null, uid, next);
		}, function(err, user) {
			//console.log('USER', err, user);
			// bad user defaults to a guest
			if (!user) user = {};
			// context is a superposition of user roles
			if (config.security.bypass) user.roles = fullRole;
			var caps = _.extend.apply(null, [{}].concat(_.map(user.roles, function(x){return roles[x] || {};})));
			// set context user
			Object.defineProperty(caps, 'user', {value: user});
			//
			//console.log('CAPS', user, caps);
			callback(null, caps);
		});
	}

	//
	// verify provided credentials, return the user context
	// used in auth middleware
	//
	function checkCredentials(uid, password, callback) {
		Next(null, function(err, result, next) {
			getCapability(uid, next);
		}, function(err, context) {
			var user = context.user;
			// user not found
			if (!user.id) {
				// logout
				if (!uid) {
					callback();
				// no such user
				} else {
					callback('usernotfound');
				}
			} else {
				if (!user.password || user.blocked) {
					callback('userblocked');
				} else if (user.password !== encryptPassword(password, user.salt)) {
					// N.B. if password is false return the user existence status
					callback('userinvalid', password === false ? true : undefined);
				} else {
					callback(null, context);
				}
			}
		});
	}

	//
	// signup new user
	// used in auth middleware
	//
	function signup(data, callback) {
		// no context means to use root's one
		model.Affiliate.add(null, data, callback);
	}

	//
	// return security provider
	//
	callback(null, {
		getCapability: getCapability,
		checkCredentials: checkCredentials,
		signup: signup
	});
});

};
