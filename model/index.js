'use strict';

// TODO: beautify
global._ = require('underscore');
require('underscore-data');
var Database = require('../lib/database');

var schema = {}, model = {}, facets = {};

//
// collect entities schemas
//
require('fs').readdirSync(__dirname + '/entities').forEach(function(name){
	if (name.substr(name.length-3) === '.js') {
		name = name.substr(0, name.length-3);
		//if (name === 'index') return;
		Object.defineProperty(schema, name, {get: function(){
			return require('./entities/' + name);
		}, enumerable: true});
	}
});
//console.log('SCHEMA', schema);

//
// connect to MongoDB instance, register entities
//
// N.B. connection is async process
//
var db = new Database('', schema, function(err, result){
	model = result || {};
	makeFacets();
});

//
// collect roles. TODO: should themselves be DB-backed
//
var roles = require('./roles');
//console.log('ROLES', roles);
//console.log('ROLES', _.map(roles, function(x){return x.name}));

function expand(roleNames){
	var res = [];
	_.each(_.select(roles, function(x){return ~roleNames.indexOf(x.id);}), function(role){
		//console.log(role);
		if (role.roles) {
			var subs = expand(role.roles);
			res.push.apply(res, subs);
		}
		res.push(role);
	});
	return res;
}

function caps(roleNames, justNames){
	var roles = _.unique(expand(roleNames), function(x){return x.id});
	if (justNames) roles = _.map(roles, function(x){return x.id});
	return roles;
}

function canDelegate(hasRoleNames, roleNames){
	var hasRoles = caps(hasRoleNames, true);
	return _.intersect(hasRoles, roleNames);
}

//
// map roles to facets
//
function makeFacets(){
	_.each(_.map(roles, function(x){return x.id}), function(id){
		var facet = facets[id] = {};
		_.each(caps([id]), function(role){
			//console.log('FACET', id, role);
			var obj = model[role.entity];
			if (!obj) return;
			if (!facet.hasOwnProperty(role.entity)) facet[role.entity] = {};
			_.each(role.methods, function(definition){
				var name, prop;
				//console.log('DEF', definition);
				if (Array.isArray(definition)) {
					name = definition[1];
					prop = definition[0];
					if (typeof prop != 'function' || prop.prototype.match) {
						prop = _.get(obj, prop);
					}
				} else {
					name = definition;
					prop = obj[name];
				}
				if (prop) {
					Object.defineProperty(facet[role.entity], name, {value: prop, enumerable: true});
				}
			});
		});
	});
}

//
// given the user, return its capabilities
//
function getCapability(user, next){
	//console.log('FACET', [{}].concat(_.map(user.roles, function(x){return facets[x];})));
	var ctx = _.extend.apply(null, [{}].concat(_.map(user.roles, function(x){return facets[x];})));
	//Object.defineProperty(ctx, 'user', {value: user});
	console.log('CAPS', ctx);
	if (next) next(null, ctx); else return ctx;
}

//
// expose interface
//
module.exports = {
	getCapability: getCapability
};

//
// some tests
//
if (!module.parent) {
	//console.log(_.map(caps(['User-admin', 'Foo-query-remove', 'User-get']), function(x){return x.id}));
//	console.log(canDelegate(['User-admin', 'Foo-query-remove'], ['User-get']));
//	console.log(canDelegate(['User-get'], ['User-get']));
	setTimeout(function(){
	getCapability({id:'aaa',roles:['User-admin']},function(err,ctx){console.log('CTX',ctx);ctx.User.query(ctx, '',console.log)});
	//getCapability({id:'aaa',roles:require('./roles/admin')},function(err,ctx){console.log('CTX',ctx);ctx.User.query(ctx, '',console.log)});
	},500);
}
