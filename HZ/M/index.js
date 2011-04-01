'use strict';

// TODO: beautify
global._ = require('underscore');
require('underscore-data');
var Database = require('../lib/database');

var schema = {}, model = {}, facets = {};

//
// collect entities schemas
//
schema = require('./schema');
//console.log('SCHEMA', schema);

//
// connect to MongoDB instance, register entities
//
// N.B. connection is async process
//
var db = new Database('', schema, function(err, result){
	model = result || {};
	//
	// patch User entity, to obey security
	//
	//
	// collect roles
	//
	//model.Role.query(null, '', )
	var roles = require('./roles');
	//console.log('ROLES', roles);
	makeFacets(roles);
});

//
// map roles to facets
//
// N.B. this should be called whenever roles are changed
//
function makeFacets(roles){

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

	//module.exports.canDelegate = 
	function canDelegate(hasRoleNames, roleNames){
		var hasRoles = caps(hasRoleNames, true);
		return _.intersect(hasRoles, roleNames);
	}

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
	// TODO: memoize by sorted joined user.roles?
	var ctx = _.extend.apply(null, [{}].concat(_.map(user.roles, function(x){return facets[x] || {};})));
	Object.defineProperty(ctx, 'user', {value: user});
	//console.log('CAPS', ctx);
	if (next) next(null, ctx); else return ctx;
}

//
// expose interface
//
module.exports = {
	checkCredentials: null,
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

	//getCapability({id:'aaa',roles:['User-admin']},function(err,ctx){console.log('CTX',ctx);ctx.User.query(ctx, '',console.log)});
	var ctx = getCapability({id:'aaa',roles:['User-admin']});
	ctx.User.query(ctx, '',console.log);
	//getCapability({id:'aaa',roles:require('./roles/admin')},function(err,ctx){console.log('CTX',ctx);ctx.User.query(ctx, '',console.log)});

	},500);
}
