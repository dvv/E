'use strict';

//
// Role is {name: String, entity: String, methods: ArrayOfString, roles: ArrayOfRole}
//

global._ = require('underscore');

var allRoles = [
{
	name: 'Foo-query-remove',
	entity: 'Foo',
	methods: ['query', 'remove']
},{
	name: 'Foo-get-update',
	entity: 'Foo',
	methods: ['get', 'update', [function hz(){}, 'vhz']]
},{
	name: 'User-query',
	entity: 'User',
	methods: ['query']
},{
	name: 'User-get',
	entity: 'User',
	methods: ['get']
},{
	name: 'User-remove',
	entity: 'User',
	methods: ['remove']
},{
	name: 'User-read',
	roles: ['User-query', 'User-get']
},{
	name: 'User-change',
	roles: ['User-update', 'User-remove']
},{
	name: 'User-admin',
	roles: ['User-read', 'User-change']
}
];

function collect(roles, roleNames){
	var res = [];
	_.each(_.select(roles, function(x){return ~roleNames.indexOf(x.name);}), function(role){
		//console.log(role);
		if (role.roles) {
			var subs = collect(roles, role.roles);
			res.push.apply(res, subs);
		}
		res.push(role);
	});
	return res;
	//return _.unique(res, function(x){return x.name});
}

function caps(roleNames, justNames){
	var roles = _.unique(collect(allRoles, roleNames), function(x){return x.name});
	if (justNames) roles = _.map(roles, function(x){return x.name});
	return roles;
}

function canDelegate(hasRoleNames, roleNames){
	var hasRoles = caps(hasRoleNames, true);
	return _.intersect(hasRoles, roleNames);
}

module.exports = allRoles;

if (!module.parent) {
	//console.log(_.map(caps(['User-admin', 'Foo-query-remove', 'User-get']), function(x){return x.name}));
	console.log(canDelegate(['User-admin', 'Foo-query-remove'], ['User-get']));
	console.log(canDelegate(['User-get'], ['User-get']));
}
