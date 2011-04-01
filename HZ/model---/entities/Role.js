'use strict';

//var db = require('../');

//
// Role is an array of rights granted upon entities
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
