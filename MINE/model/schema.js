'use strict';

var db = require('../lib/database');

//
// define standard roles priority
//
var rolePriority = ['editor', 'author', 'creator', 'reader', 'viewer'];


//
// generic user entity
//

var User = {
	type: 'object',
	properties: {
		// primary key, "login"
		id: {
			type: 'string',
			pattern: '^[a-zA-Z0-9_]+$',
			veto: {
				update: true
			}
		},
		// subdivision, to denote user flavor
		type: {
			type: 'string',
			'enum': ['Admin', 'Affiliate']
		},
		// array of role names, which define the access level to a certain entity
		// role name is <Entity>-<level>
		roles: {
			type: 'array',
			items: {
				type: 'string',
				'enum': function(value) {
					//if (!value) return false;
					//console.log('VALIDATEROLE', value, this);
					// honor roles hierarchy
					var has = this.user && this.user.roles || [];
					var parts = value.split('-', 2);
					var prefix = new RegExp('^' + parts[0] + '-');
					//has = _.filter(has, function(r){return r.match(prefix)});
					var ret = false;
					_.each(has, function(r) {
						var hasParts = r.split('-', 2);
						if (parts[0] === hasParts[0]) {
							var priority = rolePriority.indexOf(parts[1]);
							var hasPriority = rolePriority.indexOf(hasParts[1]);
							//console.log('HAS', hasPriority, 'GRANTS', priority);
							if (~priority && ~hasPriority && priority >= hasPriority) {
								ret = true;
								// TODO: break the loop
							}
						}
					});
					return ret;
				}
			},
			default: []
		},
		// blocking status, non-empty string
		blocked: {
			type: 'string',
			optional: true
		},
		// user approval status, to help self-registration
		status: {
			type: 'string',
			'enum': ['pending', 'approved', 'declined'],
			default: 'pending'
		},
		// authentication secret, hashed by SHA1 with the salt
		password: {
			type: 'string'
		},
		// salt for password
		salt: {
			type: 'string'
		},
		// secret token, to ask from a user who wants to recover
		secret: {
			type: 'string',
			optional: true
		},
		// array of arbitrary strings to tag the user
		tags: {
			type: 'array',
			items: {
				type: 'string'
			},
			default: []
		},
		// user human name
		name: {
			type: 'string',
			optional: true
		},
		// user email, to communicate
		email: {
			type: 'string',
			pattern: /^([\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+\.)*[\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+@((((([a-z0-9]{1}[a-z0-9\-]{0,62}[a-z0-9]{1})|[a-z])\.)+[a-z]{2,6})|(\d{1,3}\.){3}\d{1,3}(\:\d{1,5})?)$/i,
			optional: true
		},
		// user time zone
		timezone: {
			type: 'string',
			// TODO: from simple-geo
			'enum': ['UTC-11', 'UTC-10', 'UTC-09', 'UTC-08', 'UTC-07', 'UTC-06', 'UTC-05', 'UTC-04', 'UTC-03', 'UTC-02', 'UTC-01', 'UTC+00', 'UTC+01', 'UTC+02', 'UTC+03', 'UTC+04', 'UTC+05', 'UTC+06', 'UTC+07', 'UTC+08', 'UTC+09', 'UTC+10', 'UTC+11', 'UTC+12'],
			default: 'UTC+04'
		}
	}
};

//
// Admin
//
var Admin = {
	type: 'object',
	properties: {
		id: User.properties.id,
		// type is always 'admin'
		type: db.fix(db.ro(User.properties.type), 'admin'),
		// default role is to author new admins
		roles: db.def(User.properties.roles, ['Admin-author']),
		// admin can block users
		blocked: User.properties.blocked,
		// admin can control approval status
		status: User.properties.status,
		// admin can set initial user password
		password: db.co(User.properties.password),
		// admin can salt initial user password
		salt: db.co(User.properties.salt),
		// admin can tag users
		tags: User.properties.tags,
		// admin can read user name
		name: db.ro(User.properties.name),
		// admin can read user email
		email: db.ro(User.properties.email),
		// admin can read user time zone
		timezone: db.ro(User.properties.timezone)
	},
	// admins are stored in User collection
	collection: 'User',
	// additional conditions imposed on all accessors
	constraints: [
		{key: 'type', value: 'admin', op: 'eq'}
	]
};

//
// Affiliate
//
var Affiliate = {
	type: 'object',
	properties: {
		id: User.properties.id,
		// type is always 'affiliate'
		type: db.fix(db.ro(User.properties.type), 'affiliate'),
		// default affiliate role is nothing
		roles: db.def(User.properties.roles, []),
		// affiliate can block subordinates
		blocked: User.properties.blocked,
		// affiliate can approve subordinates
		status: User.properties.status,
		// affiliate can set initial subordinate password
		password: db.co(User.properties.password),
		// affiliate can salt initial subordinate password
		salt: db.co(User.properties.salt),
		// affiliate can tag subordinates
		tags: User.properties.tags,
		// affiliate can read subordinate name
		name: db.ro(User.properties.name),
		// affiliate can read subordinate email
		email: db.ro(User.properties.email),
		// affiliate can read subordinate time zone
		timezone: db.ro(User.properties.timezone)
	},
	// affiliates are stored in User collection
	collection: 'User',
	// additional conditions imposed on all accessors
	constraints: [
		{key: 'type', value: 'affiliate', op: 'eq'}
	]
};

//
// User as seen by himself
//
var Self = {
	type: 'object',
	properties: {
		id: User.properties.id,
		// user can read his type
		type: db.ro(User.properties.type),
		// user can read his roles
		roles: db.ro(User.properties.roles),
		// user can set his password
		password: db.wo(User.properties.password),
		// user can salt his password
		salt: db.wo(User.properties.salt),
		// user can read/write his secret
		secret: User.properties.secret,
		// user can rename himself
		name: User.properties.name,
		// user can control his email
		email: User.properties.email,
		// user can control his time zone
		timezone: User.properties.timezone
	},
	// users are stored in User collection
	collection: 'User'
};

//
// generic testing entity
//
var Foo = {
	type: 'object',
	additionalProperties: false,
	properties: {
		id: {
			type: 'string',
			pattern: '^[a-zA-Z0-9_]+$',
			veto: {
				update: true
			}
		},
		name: {
			type: 'string'
		},
		localName: {
			type: 'string',
			optional: true,
			veto: {
				query: true
			}
		}
	}
};

module.exports = {
	Self: Self,
	Admin: Admin,
	Affiliate: Affiliate,
	Foo: Foo,
};
