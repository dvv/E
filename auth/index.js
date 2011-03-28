'use strict';

global.extend = function extend(obj) {
	Array.prototype.slice.call(arguments).forEach(function(source){
		for (var prop in source) obj[prop] = source[prop];
	});
	return obj;
};

function drill(obj, path, remove) {
	var index, name, orig, part, _i, _j, _len, _len2, _ref;
	if (Array.isArray(path)) {
		if (remove) {
			_ref = path, path = 2 <= _ref.length ? __slice.call(_ref, 0, _i = _ref.length - 1) : (_i = 0, []), name = _ref[_i++];
			orig = obj;
			for (index = 0, _len = path.length; index < _len; index++) {
				part = path[index];
				obj = obj && obj[part];
			}
			if (obj != null ? obj[name] : void 0) {
				delete obj[name];
			}
			return orig;
		} else {
			for (_j = 0, _len2 = path.length; _j < _len2; _j++) {
				part = path[_j];
				obj = obj && obj[part];
			}
			return obj;
		}
	} else if (path === void 0) {
		return obj;
	} else {
		if (remove) {
			delete obj[path];
			return obj;
		} else {
			return obj[path];
		}
	}
}

function proxy(obj, exposes) {
	var facet = {};
	exposes.forEach(function(definition){
		var name, prop;
		if (Array.isArray(definition)) {
			name = definition[1];
			prop = definition[0];
			if (typeof prop != 'function' || prop.prototype.match) {
				prop = drill(obj, prop);
			}
		} else {
			name = definition;
			prop = obj[name];
		}
		if (prop) {
			//facet[name] = prop;
			Object.defineProperty(facet, name, {get: function(){
				return prop;//.bind(null, ctx);
			}, enumerable: true});
		}
	});
	return facet;
}

var model = {}, roles = {};

require('fs').readdirSync('model').forEach(function(name){
	if (name.substr(name.length-3) === '.js') {
		name = name.substr(0, name.length-3);
		Object.defineProperty(model, name, {get: function(){
			return require('./model/' + name);
		}, enumerable: true});
	}
});
//console.log('MODEL', model);

require('fs').readdirSync('roles').forEach(function(name){
	if (name.substr(name.length-3) === '.js') {
		name = name.substr(0, name.length-3);
		Object.defineProperty(roles, name, {get: function(){
			return require('./roles/' + name);
		}, enumerable: true});
	}
});
//console.log('ROLES', roles);

function getCapability(user, next){
	var ctx = {};
	try {
		user.roles.forEach(function(name){
			roles[name].forEach(function(role){
				if (!ctx.hasOwnProperty(role.entity)) ctx[role.entity] = {};
				var obj = model[role.entity];
				var facet = ctx[role.entity];
				role.methods.forEach(function(definition){
					var name, prop;
					if (Array.isArray(definition)) {
						name = definition[1];
						prop = definition[0];
						if (typeof prop != 'function' || prop.prototype.match) {
							prop = drill(obj, prop);
						}
					} else {
						name = definition;
						prop = obj[name];
					}
					if (prop) {
						Object.defineProperty(facet, name, {get: function(){
							return prop.bind(null, ctx);
						}, enumerable: true});
					}
					/*	Object.defineProperty(facet, definition, {get: function(){
							return obj[definition].bind(null, ctx);
						}, enumerable: true});*/
				});
			});
		});
	} catch (err) {
		// errors result in empty context
		ctx = {};
	}
	Object.defineProperty(ctx, 'user', {value: user});
	next(null, ctx);
}

module.exports = getCapability;
