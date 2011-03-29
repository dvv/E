'use strict';

var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty;

module.exports = function(config, model, callback) {

	//
	// capability holder
	//
	var facets = {};

	//
	// secrets helpers
	//
	var Crypto = require('crypto');
	function nonce() {
		return (Date.now() & 0x7fff).toString(36) + Math.floor(Math.random() * 1e9).toString(36) + Math.floor(Math.random() * 1e9).toString(36) + Math.floor(Math.random() * 1e9).toString(36);
	};
	function sha1(data, key) {
		var hmac;
		hmac = Crypto.createHmac('sha1', '');
		hmac.update(data);
		return hmac.digest('hex');
	};
	function encryptPassword(password, salt) {
		return sha1(salt + password + config.security.secret);
	};

	//
	// secure root account
	//
	// TODO: the root is the cause on many quirks
	// may be make it HTTP Authenticated?!
	//
	var root = config.security.root || {};
	root.salt = nonce();
	root.password = encryptPassword(root.password, root.salt);

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
			// check if we are root. if so, fake the answer
			if (root.id === id) {
				var user = _.extend({}, {
					id: root.id,
					type: root.type,
					email: root.email
				});
				next(null, user);
			} else {
				// determine if id is equal to the context user' id
				var _ref;
				var isSelf = id === (context != null ? (_ref = context.user) != null ? _ref.id : void 0 : void 0);
				// if so, return private view
				if (isSelf) {
					User._get(model.UserSelf.schema, context, id, next);
				// else return admin view
				} else {
					User.get(context, id, next);
				}
			}
		},
		//
		// query -- goes intact
		//
		query: function(context, query, next) {
			User.query(context, query, next);
		},
		//
		// add -- forbid clashing with root's name; assign crypted password and salt
		//
		add: function(context, data, next) {
			if (data == null) data = {};
			Next(context,
				function(err, result, step) {
					step(null, (root.id === data.id ? root : null));
				},
				function(err, user, step) {
					if (err) return step(err);
					if (user) return step([{property: 'id', message: 'duplicated'}]);
					if (!data.password) {
						data.password = nonce().substring(0, 7);
					}
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
			var plainPassword = void 0;
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
				// report changes (email?)
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
	var userTypes = {
		affiliate: 'Affiliate',
		admin: 'Admin'
	};
	_.each(userTypes, function(name, type) {
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
		// TODO: reuse Database.register logic?
		Object.defineProperties(model[name], {
			id: {
				value: name
			},
			schema: {
				value: User.schema
			}
		});
	});

	//
	// get capability of a user uid
	//
	function getCapability(uid, next) {
		Next(null,
			function(err, result, step) {
				// root is special
				if (root.id === uid) {
					step(null, _.clone(root));
				} else {
					User._get(null, this, uid, step);
				}
			},
			function(err, user, step) {
				// get the user level
				var level;
				// bad user defaults to a guest
				if (user == null) user = {};
				// only root can access disabled server
				if (config.server.disabled && root.id !== user.id) {
					level = 'none';
				// check if security may be bypassed
				} else if (config.security.bypass || root.id === user.id) {
					level = 'root';
				// authenticated? -> user.type level
				} else if (user.id) {
					level = user.type;
				// guest? -> 'public' level
				} else {
					level = 'public';
				}
				// context is a collection of facets due to user level...
				var context = _.extend({}, facets[level] || {});
				// ...plus due to user groups
				// TODO: hardcode a mapreduce to get groups -> roles
				//_.each(user.groups, function(group){
				//	_.extend(context, facets[group]);
				//});
				//model.Group.query(context, user.groups, function(err, groups){
				//	model.Role.query(context, user.groups, function(err, groups){
				//	});
				//});
				// set context.user
				context.user = user;
				next(null, context);
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
					if (uid) {
						next('Invalid user');
					} else {
						next();
					}
				} else {
					if (!user.password || user.blocked) {
						next('Invalid user');
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
	// facet helpers
	//

	function PermissiveFacet(obj) {
		var plus = __slice.call(arguments, 1);
		var expose = ['schema', 'id', 'query', 'get', 'add', 'update', 'remove', 'delete', 'undelete', 'purge'];
		if (plus.length) {
			expose = expose.concat(plus);
		}
		return _.proxy(obj, expose);
	}
	function RestrictiveFacet(obj) {
		var plus = __slice.call(arguments, 1);
		var expose = ['schema', 'id', 'query', 'get'];
		if (plus.length) {
			expose = expose.concat(plus);
		}
		return _.proxy(obj, expose);
	}

	//
	// facets
	//

	// public
	FacetForGuest = _.freeze(_.extend({}, {
	}));

	// authenticated user
	FacetForUser = _.freeze(_.extend({}, FacetForGuest, {
		profile: {
			query: model.User.getProfile,
			update: model.User.setProfile
		}
	}));

	// DB owner
	FacetForRoot = _.freeze(_.extend({}, FacetForUser, {
		Affiliate: PermissiveFacet(model.Affiliate),
		Admin: PermissiveFacet(model.Admin),
		Role: PermissiveFacet(model.Role),
		Group: PermissiveFacet(model.Group),
		Language: PermissiveFacet(model.Language),
		Currency: PermissiveFacet(model.Currency, 'fetch', 'setDefault'),
		Geo: PermissiveFacet(model.Geo, 'fetch')
	}));

	// affiliate
	FacetForAffiliate = _.freeze(_.extend({}, FacetForUser, {}));
	FacetForReseller = _.freeze(_.extend({}, FacetForAffiliate, {
		Affiliate: FacetForRoot.Affiliate
	}));

	// merchant
	FacetForMerchant = _.freeze(_.extend({}, FacetForUser, {}));

	// admin
	FacetForAdmin = _.freeze(_.extend({}, FacetForUser, {
		Affiliate: FacetForRoot.Affiliate,
		Admin: FacetForRoot.Admin,
		Role: FacetForRoot.Role,
		Group: FacetForRoot.Group,
		Language: FacetForRoot.Language,
		Currency: FacetForRoot.Currency,
		Geo: FacetForRoot.Geo
	}));
	facets.public = FacetForGuest;
	facets.user = FacetForUser;
	facets.root = FacetForRoot;
	facets.affiliate = FacetForAffiliate;
	facets.merchant = FacetForMerchant;
	facets.admin = FacetForAdmin;

	//
	// application
	//
	var app = {
		getCapability: getCapability,
		checkCredentials: checkCredentials
	};
	callback(null, app);

};
