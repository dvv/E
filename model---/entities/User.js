'use strict';

//
// helpers to resctrict access to properties
//

// read-only
function ro(attr) {
	return _.extend({}, attr, {
		veto: {
			update: true
		}
	});
}

// write-only
function wo(attr) {
	return _.extend({}, attr, {
		veto: {
			get: true
		}
	});
}

// create-only
function cr(attr) {
	return _.extend({}, attr, {
		veto: {
			get: true,
			update: true
		}
	});
}

var userTypes = {
	affiliate: 'Affiliate',
	admin: 'Admin'
};

//
// generic user entity
//
var UserEntity = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			pattern: '^[a-zA-Z0-9_]+$',
			veto: {
				update: true
			}
		},
		type: {
			type: 'string',
			enum: _.values(userTypes)
		},
		roles: {
			type: 'array',
			items: _.extend({}, schema.Group.properties.id, {
				"enum": function(value, callback) {
					// TODO: only allow groups to which parent user belong
					return this.Group.get(value, function(err, result) {
						return callback(!result, result);
					});
				}
			}),
			optional: true
		},
		blocked: {
			type: 'string',
			optional: true
		},
		status: {
			type: 'string',
			"enum": ['pending', 'approved', 'declined'],
			"default": 'pending'
		},
		password: {
			type: 'string'
		},
		salt: {
			type: 'string'
		},
		secret: {
			type: 'string',
			optional: true
		},
		tags: {
			type: 'array',
			items: {
				type: 'string'
			},
			optional: true
		},
		name: {
			type: 'string',
			optional: true
		},
		email: {
			type: 'string',
			pattern: /^([\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+\.)*[\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+@((((([a-z0-9]{1}[a-z0-9\-]{0,62}[a-z0-9]{1})|[a-z])\.)+[a-z]{2,6})|(\d{1,3}\.){3}\d{1,3}(\:\d{1,5})?)$/i,
			optional: true
		},
		timezone: {
			type: 'string',
			// TODO: from simple-geo
			"enum": ['UTC-11', 'UTC-10', 'UTC-09', 'UTC-08', 'UTC-07', 'UTC-06', 'UTC-05', 'UTC-04', 'UTC-03', 'UTC-02', 'UTC-01', 'UTC+00', 'UTC+01', 'UTC+02', 'UTC+03', 'UTC+04', 'UTC+05', 'UTC+06', 'UTC+07', 'UTC+08', 'UTC+09', 'UTC+10', 'UTC+11', 'UTC+12'],
			"default": 'UTC+04'
		},
		lang: _.extend({}, schema.Language.properties.id, {
			"enum": function(value, next) {
				return next(null);
			},
			optional: true
		})
	}
};

//
// User as seen by admins
//
schema.User = {
	type: 'object',
	properties: {
		id: UserEntity.properties.id,
		type: ro(UserEntity.properties.type),
		roles: UserEntity.properties.roles,
		blocked: UserEntity.properties.blocked,
		status: UserEntity.properties.status,
		password: cr(UserEntity.properties.password),
		salt: cr(UserEntity.properties.salt),
		tags: UserEntity.properties.tags,
		name: ro(UserEntity.properties.name),
		email: ro(UserEntity.properties.email),
		timezone: ro(UserEntity.properties.timezone),
		lang: ro(UserEntity.properties.lang)
	}
};

//
// User as seen by the user himself
//
schema.UserSelf = {
	type: 'object',
	properties: {
		id: UserEntity.properties.id,
		type: ro(UserEntity.properties.type),
		roles: ro(UserEntity.properties.roles),
		password: wo(UserEntity.properties.password),
		salt: wo(UserEntity.properties.salt),
		name: UserEntity.properties.name,
		email: UserEntity.properties.email,
		timezone: UserEntity.properties.timezone,
		lang: UserEntity.properties.lang,
		secret: UserEntity.properties.secret
	}
};

module.exports = schema;
