'use strict';

/*
 *
 * Copyright(c) 2011 Vladimir Dronnikov <dronnikov@gmail.com>
 * MIT Licensed
 *
*/

//
// many thanks to documentcloud/underscore
//

// Escape special HTML entities
function escapeHTML(x) {
	return (x == null) ? '' :
		String(x)
		.replace(/&(?!\w+;|#\d+;|#x[\da-f]+;)/gi, '&amp;')
		.replace(/</g, '&lt;').replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
		// FIXME: single quotes?!
}

// define template syntax
var templateSettings = {
	// microtemplate
	//evaluate		: /<%([\s\S]+?)%>/g,
	//interpolate : /<%=([\s\S]+?)%>/g,
	//escape			: /<%!([\s\S]+?)%>/g,
	// ejs
	evaluate		: /<%([\s\S]+?)%>/g,
	interpolate : /<%-([\s\S]+?)%>/g,
	escape			: /<%=([\s\S]+?)%>/g,
	// mustache?
	//evaluate: /\{\{([\s\S]+?)\}\}/g,
	//interpolate: /\$\$\{([\s\S]+?)\}/g,
	//escape: /\$\{([\s\S]+?)\}/g,
};

// template parser
function template(str, data, settings) {
	var c	= settings || templateSettings;
	var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
		'with(obj||{}){__p.push(\'' +
		str.replace(/\\/g, '\\\\')
		.replace(/'/g, "\\'")
		.replace(c.interpolate, function(match, code) {
			return "'," + code.replace(/\\'/g, "'") + ",'";
		})
		.replace(c.escape || null, function(match, code) {
			return "'," + escapeHTML(code.replace(/\\'/g, "'")) + ",'";
		})
		.replace(c.evaluate || null, function(match, code) {
			return "');" + code.replace(/\\'/g, "'")
													.replace(/[\r\n\t]/g, ' ') + "__p.push('";
		})
		.replace(/\r/g, '\\r')
		.replace(/\n/g, '\\n')
		.replace(/\t/g, '\\t')
		+ "');}return __p.join('');";
	//console.log('\n\n\n' + tmpl + '\n\n\n');
	var func = new Function('obj', tmpl);
	return data ? func(data) : func;
}

var Fs = require('fs');
var Path = require('path');
var ENOENT = require('constants').ENOENT;

// parsed templates cache
// N.B. we aggressively cache since we rely on watch/reload
var cache = {};

//
// return templated output, data from options.vars
//
module.exports = function render(name, options, callback) {

	// setup
	if (!options) options = {};
	if (!options.vars) options.vars = {};

	// render from cache
	if (cache.hasOwnProperty(name)) {
		callback(null, cache[name](options.vars));
	// cache
	} else {
		name = Path.join(options.path, name);
		if (options.ext) name += options.ext;
		//console.log('RENDER', name);
		Fs.readFile(name, function(err, html) {
			if (err) return callback(err.errno === ENOENT ? null : err, null);
			cache[name] = template(html.toString('utf8'));
			callback(null, cache[name](options.vars));
		});
	}

};
