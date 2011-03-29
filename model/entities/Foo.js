'use strict';

module.exports = {
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
			optional: true
		}
	}
};
