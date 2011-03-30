'use strict';

/*
 *
 * Copyright(c) 2011 Vladimir Dronnikov <dronnikov@gmail.com>
 * MIT Licensed
 *
*/

//
// simplified version of creationix/Step
//
var __slice = Array.prototype.slice;
global.Next = function Next(context /*, steps*/) {
	var steps = __slice.call(arguments, 1);
	var next = function(err, result) {
		var fn = steps.shift();
		if (fn) {
			try {
				fn.call(context, err, result, next);
			} catch (err) {
				next(err);
			}
		} else {
			if (err) throw err;
		}
	};
	next();
};
Next.nop = function() {};

//
// typeof quirks
//
global.typeOf = function typeOf(value) {
	var s = typeof value;
	if (s === 'object') {
		if (value) {
			if (value instanceof Array) {
				s = 'array';
			}
		} else {
			s = 'null';
		}
	// RegExp in V8 is function!
	} else if (s === 'function' && value.prototype.match) {
		s = 'object';
	}
	return s;
}

//
// naive deep copy
//
global.deepCopy = function deepCopy(source, target, overwrite){
	var k, v;
	for (k in source) if (source.hasOwnProperty(k)) {
		v = source[k];
		if (typeOf(v) === 'object' && typeOf(target[k]) === 'object') {
			deepCopy(v, target[k], overwrite);
		} else if (overwrite || !target.hasOwnProperty(k)) {
			target[k] = v;
		}
	}
	return target;
}
