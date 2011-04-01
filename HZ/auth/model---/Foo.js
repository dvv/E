'use strict';

var entity = 'Foo';

// TODO: introduce "own" decorators

module.exports = {
	query: function(ctx, query, next){
		next(null, [{desc: entity, user: ctx.user}]);
	},
	get: function(ctx, id, next){
		next(null, {id: 'whatever', desc: entity});
	},
	add: function(ctx, doc, next){
		next(null, {id: 'newlycreated', desc: entity});
	},
	remove: function(ctx, query, next){
		next(null);
	},
	update: function(ctx, query, doc, next){
		next(null, {id: 'updated', desc: entity});
	},
	rpc: {
		act: function(ctx, params, next){
			next(null, 'RPC act called!');
		}
	}
};

Object.defineProperties(module.exports, {
	id: {value: entity},
	schema: {value: {SCHEMA: entity}}
});

console.log('LOAD', entity);
