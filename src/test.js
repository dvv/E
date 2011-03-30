var assert = require('assert');

require('../lib/helpers');

global._ = require('underscore');
require('underscore-data');
var DB = require('./database');

var user = {
	id: 'root',
	roles: ['Foo-editor', 'Bar-editor']
};

Next({}, function(err, result, next){

	new DB('', {
		Foo: {
			type: 'object',
			properties: {
				id: {type: 'any'},
				queriable: {
					type: 'string',
					veto: {
						get: true,
						update: true
					}
				},
				gettable: {
					type: 'string',
					veto: {
						query: true,
						update: true
					}
				},
				updatable: {
					type: 'string',
					veto: {
						query: true,
						get: true
					}
				}
			}
		},
		Bar: {
			properties: {
				_meta: {type: 'any', veto: true}
			},
			additionalProperties: true,
			saveChanges: true
		},
	}, next);

}, function(err, result, next){

	//console.log(arguments);

	var model = result || {};
	this.model = model;
	roles = {};
	_.each(model, function(v, k){
		_.each(v.roles, function(m, n){
			var o = {};
			o[k] = m;
			roles[n] = o;
		});
	});
	//this.roles = roles;
	console.log(roles);

	var context = _.extend.apply(null, [{}].concat(_.map(user.roles, function(r){return roles[r] || {};})));
	Object.defineProperty(context, 'user', {value: user});
	next(null, context);

}, function(err, context, next){

	this.context = context;
	//console.log('CONTEXT', context);
	this.context.Foo.remove(this.context, 'nonexistent!=foo', next);

}, function(err, result, next){
	//console.log('REMOVED', arguments);
	assert.equal(err, null);
	assert.equal(result, undefined);

	this.context.Foo.add(this.context, {id: 'a', queriable: 'queriable', gettable: 'gettable', updatable: 'updatable'}, next);

}, function(err, result, next){
	//console.log('ADDED', arguments);
	assert.equal(err, null);
	assert.deepEqual(result, {id: 'a', gettable: 'gettable'});

	this.context.Foo.query(this.context, '', next);

}, function(err, result, next){
	//console.log('QUERIED', arguments);
	assert.equal(err, null);
	assert.deepEqual(result, [{id: 'a', queriable: 'queriable'}]);

	this.context.Foo.get(this.context, result[0].id, next);

}, function(err, result, next){
	//console.log('GOT', arguments);
	assert.equal(err, null);
	assert.deepEqual(result, {id: 'a', gettable: 'gettable'});

	this.context.Foo.update(this.context, [result.id], {queriable: 'changed', gettable: 'changed', updatable: 'changed'}, next);

}, function(err, result, next){
	//console.log('UPDATED', arguments);
	assert.equal(err, null);
	assert.equal(result, undefined);

	// quirky access to override schema bindings
	this.model.Foo._getAny(null, this.context, 'a', next);

}, function(err, result, next){
	//console.log('GOT', arguments);
	assert.equal(err, null);
	var _meta = result._meta;
	delete result._meta;
	assert.deepEqual(result, {id: 'a', queriable: 'queriable', gettable: 'gettable', updatable: 'changed'});
	assert.equal(_meta.history.length, 1);
	var history = _meta.history[0];
	assert.deepEqual(history.who, [user.id]);

	// Bar -- liberal schema + saveChanges
	this.context.Bar.remove(this.context, 'nonexistent!=foo', next);

}, function(err, result, next){
	//console.log('REMOVED', arguments);
	assert.equal(err, null);
	assert.equal(result, undefined);

	this.context.Bar.add(this.context, {id: 'a', foo: 'bar'}, next);

}, function(err, result, next){
	//console.log('ADDED', arguments);
	assert.equal(err, null);
	assert.deepEqual(result, {id: 'a', foo: 'bar'});

	this.context.Bar.query(this.context, '', next);

}, function(err, result, next){
	//console.log('QUERIED', arguments);
	assert.equal(err, null);
	assert.deepEqual(result, [{id: 'a', foo: 'bar'}]);

	this.context.Bar.get(this.context, result[0].id, next);

}, function(err, result, next){
	//console.log('GOT', arguments);
	assert.equal(err, null);
	assert.deepEqual(result, {id: 'a', foo: 'bar'});

	this.context.Bar.update(this.context, [result.id], {foo: 'baz', bar: 'foo'}, next);

}, function(err, result, next){
	//console.log('UPDATED', arguments);
	assert.equal(err, null);
	assert.equal(result, undefined);

	// quirky access to override schema bindings
	this.model.Bar._getAny(null, this.context, 'a', next);

}, function(err, result, next){
	//console.log('GOT', arguments);
	assert.equal(err, null);
	var _meta = result._meta;
	delete result._meta;
	assert.deepEqual(result, {id: 'a', foo: 'baz', bar: 'foo'});
	assert.equal(_meta.history.length, 2);
	var history = _meta.history;
	assert.deepEqual(history[0].who, [user.id]);
	assert.deepEqual(history[1].who, user.id);
	assert.deepEqual(history[1].what, {foo: 'baz', bar: 'foo'});

	next(null);

}, function(err, result, next){

	console.log('PASSED', err && err.stack);

});
