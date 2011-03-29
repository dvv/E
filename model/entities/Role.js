'use strict';

//
// Role is an array of rights granted upon entities
//

module.exports = {
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
				// TODO: here recursively refer module.exports
				type: 'object'
			}
		}
	}
};
