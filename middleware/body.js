'use strict';

/*
 *
 * Copyright(c) 2011 Vladimir Dronnikov <dronnikov@gmail.com>
 * MIT Licensed
 *
*/

var parseUrl = require('url').parse;
var path = require('path');

// regexp to check for valid IP string
var REGEXP_IP = /^\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}$/;

//
// fill req.body with object reflecting content of request body
//
module.exports = function setup(options) {

	// setup
	if (options == null) options = {};
	var formidable = require('formidable');
	var qs = require('qs');
	// FIXME: ensure uploadDir exists?
	var uploadDir = options.uploadDir || 'upload';

	// known parsers
	function guess(s){
		// input looks like a JSON -- use JSON.parse
		var c = s.charAt(0);
		// TODO: < signifies xml? htmlparser?
		return (c === '{' || c === '[') ? JSON.parse(s) : qs.parse(s);
	}
	var parsers = {
		'application/json': JSON.parse,
		'text/javascript': JSON.parse,
		'application/www-urlencoded': qs.parse,
		'application/x-www-form-urlencoded': qs.parse,
		'application/xml': guess,
		'text/html': guess
	};

	// handler
	return function(req, res, next) {
		// swallow .. and other URL quirks
		req.url = path.normalize(req.url);
		// parse URL
		req.uri = parseUrl(req.url);
		// skip leading ? in querystring
		req.uri.search = (req.uri.search || '').substring(1);
		/*
		// FIXME: separate middleware?
		// honor X-Forwarded-For: possibly set by a reverse proxy
		var s;
		if (s = req.headers['x-forwarded-for']) {
			if (REGEXP_IP.test(s)) {
				req.socket.remoteAddress = s;
			}
			// forget the source of knowledge
			delete req.headers['x-forwarded-for'];
		}*/
		req.body = {};
		// bodyful request?
		//if (req.method === 'POST' || req.method === 'PUT') {
			// get content type. N.B. can't just test equality, charset may be set
			// TODO: req.is()?!
			var type = req.headers['content-type'];
			type = (type) ? type.split(';')[0] : 'application/xml';
			//
			// supported content-type
			//
			if (parsers.hasOwnProperty(type)) {
				// set body encoding
				req.setEncoding('utf8');
				// collect the body
				var body = '';
				var len = options.maxLength;
				req.on('data', function(chunk) {
					body += chunk;
					// control max body length
					if (body.length > len && len > 0) {
						next(SyntaxError('Length exceeded'));
					}
				});
				// bump on read error
				req.on('error', function(err) {
					next(err);
				});
				// body collected -> parse it at once
				req.on('end', function() {
					try {
						if (body) {
							req.body = parsers[type](body);
						}
					} catch (err) {
						// catch parse errors
						return next(err);
					}
					next();
				});
			//
			// formidable
			//
			} else if (type === 'multipart/form-data') {
				// setup the form reader
				var form = new formidable.IncomingForm();
				// TODO: control ability to upload!
				form.uploadDir = uploadDir;
				if (options.maxLength) {
					form.maxFieldsSize = options.maxLength;
				}
				// handle file upload progress
				if (options.onUploadProgress) {
					form.on('fileBegin', function(field, file){
						options.onUploadProgress(file, false);
						file
						.on('progress', function(received){
							options.onUploadProgress(file);
						})
						.on('end', function(){
							options.onUploadProgress(file, true);
						})
					});
				}
				// parse the body
				form.parse(req, function(err, fields, files){
					if (err) return next(err);
					req.body = fields;
					req.files = files;
					next();
				});
			// TODO: htmlparser!
			} else {
				next();
			}
		//} else {
		//	return next();
		//}
	};
};
