'use strict';

//
// helpers to tune properties
//

// read-only
function ro(attr) {
	return _.extend({}, attr, {
		veto: {
			update: true
		}
	});
}

// query-only
function qo(attr) {
	return _.extend({}, attr, {
		veto: {
			get: true,
			update: true
		}
	});
}

// write-only
function wo(attr) {
	return _.extend({}, attr, {
		veto: {
			query: true,
			get: true
		}
	});
}

// create-only
function co(attr) {
	return _.extend({}, attr, {
		veto: {
			query: true,
			get: true,
			update: true
		}
	});
}

// fix the value
function fix(attr, value) {
	return _.extend({}, attr, {
		value: value
	});
}

// set default value
function def(attr, value) {
	return _.extend({}, attr, {
		default: value
	});
}

//
// Role is an array of rights granted upon entity, or array of another Roles
//
var Role = {
	type: 'object',
	additionalProperties: false,
	properties: {
		id: {
			type: 'string',
			veto: {
				update: true
			}
		},
		name: {
			type: 'string',
			optional: true
		},
		entity: {
			type: 'string',
			optional: true
		},
		methods: {
			type: 'array',
			items: {
				type: 'string'
			},
			optional: true
		},
		roles: {
			type: 'array',
			items: {
				type: 'string'
			},
			optional: true
		}
	}
};

//
// define standard roles priority
//
var rolePriority = ['editor', 'author', 'creator', 'reader', 'viewer'];


//
// generic user entity
//

var userTypes = {
	affiliate: 'Affiliate',
	admin: 'Admin'
};

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
			'enum': _.keys(userTypes)
		},
		roles: {
			type: 'array',
			items: {
				type: 'string',
				'enum': function(value){
					//if (!value) return false;
					//console.log('VALIDATEROLE', value, this);
					// honor roles hierarchy
					var has = this.user && this.user.roles || [];
					var parts = value.split('-', 2);
					var prefix = new RegExp('^' + parts[0] + '-');
					//has = _.filter(has, function(r){return r.match(prefix)});
					var ret = false;
					_.each(has, function(r){
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
		blocked: {
			type: 'string',
			optional: true
		},
		status: {
			type: 'string',
			'enum': ['pending', 'approved', 'declined'],
			default: 'pending'
		},
		password: {
			type: 'string',
			/*onSet: function(doc, value){
				doc.salt = nonce();
				value = encryptPassword(value, doc.salt);
			}*/
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
			default: []
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
		id: UserEntity.properties.id,
		type: fix(ro(UserEntity.properties.type), 'admin'),
		roles: def(UserEntity.properties.roles, ['Admin-author']),
		blocked: UserEntity.properties.blocked,
		status: UserEntity.properties.status,
		password: co(UserEntity.properties.password),
		salt: co(UserEntity.properties.salt),
		tags: UserEntity.properties.tags,
		name: ro(UserEntity.properties.name),
		email: ro(UserEntity.properties.email),
		timezone: ro(UserEntity.properties.timezone)
	},
	collection: 'User',
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
		id: UserEntity.properties.id,
		type: fix(ro(UserEntity.properties.type), 'affiliate'),
		roles: def(UserEntity.properties.roles, ['Affiliate-author']),
		blocked: UserEntity.properties.blocked,
		status: UserEntity.properties.status,
		password: co(UserEntity.properties.password),
		salt: co(UserEntity.properties.salt),
		tags: UserEntity.properties.tags,
		name: ro(UserEntity.properties.name),
		email: ro(UserEntity.properties.email),
		timezone: ro(UserEntity.properties.timezone)
	},
	collection: 'User',
	constraints: [
		{key: 'type', value: 'affiliate', op: 'eq'}
	]
};

//
// User as seen by the user himself
// TODO: should NOT be exposed
//
var User = {
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
		secret: UserEntity.properties.secret
	},
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
	Role: Role,
	User: User,
	Admin: Admin,
	Affiliate: Affiliate,
	Foo: Foo,
};
