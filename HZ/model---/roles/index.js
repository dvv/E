'use strict';

//
// Role is {name: String, entity: String, methods: ArrayOfString, roles: ArrayOfRole}
//

module.exports = [
{
	id: 'Foo-query-remove',
	entity: 'Foo',
	methods: ['query', 'remove']
},{
	id: 'Foo-get-update',
	entity: 'Foo',
	methods: ['get', 'update', [function hz(){}, 'vhz']]
},{
	id: 'User-query',
	entity: 'User',
	methods: ['query']
},{
	id: 'User-get',
	entity: 'User',
	methods: ['get']
},{
	id: 'User-add',
	entity: 'User',
	methods: ['add']
},{
	id: 'User-update',
	entity: 'User',
	methods: ['update']
},{
	id: 'User-remove',
	entity: 'User',
	methods: ['remove']
},{
	id: 'User-read',
	roles: ['User-query', 'User-get']
},{
	id: 'User-change',
	roles: ['User-update', 'User-remove']
},{
	id: 'User-admin',
	roles: ['User-read', 'User-change', 'User-add']
},{
	id: 'User-user',
	roles: ['User-read']
}
];
