'use strict';

/*
 *
 * Copyright(c) 2011 Vladimir Dronnikov <dronnikov@gmail.com>
 * MIT Licensed
 *
*/

var parseUrl = require('url').parse;
var Path = require('path');

// regexp to check for valid IP string
var REGEXP_IP = /^\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}$/;

//
// fill req.body with object reflecting content of request body
//
module.exports = function setup(options) {

	// setup
	if (options == null) options = {};
	var Formidable = require('formidable');
	var Qs = require('qs');
	// FIXME: ensure uploadDir exists?
	var uploadDir = options.uploadDir || 'upload';
	// htmlparser
	var HTMLParser = require('htmlparser');

	function parseJSON(data, next) {
		try {
			var r = JSON.parse(data);
			next(null, r);
		} catch (err) {
			next(err);
		}
	}

	function parseQS(data, next) {
		try {
			var r = Qs.parse(data);
			next(null, r);
		} catch (err) {
			next(err);
		}
	}

	function parseHTML(data, next) {
		var handler = new HTMLParser.DefaultHandler(next, {
			ignoreWhitespace: true,
			verbose: false
		});
		var parser = new HTMLParser.Parser(handler);
		parser.parseComplete(data);
	}

	// well-known parsers
	function guess(s, next) {
		// JSON: starts with { or [
		// XML: starts woth <
		// urlemcoded: else
		var c = s.charAt(0);
		(c === '{' || c === '[') ? parseJSON(s, next) : (c === '<') ? parseHTML(s, next) : parseQS(s, next);
	}

	var parsers = {
		'application/json': parseJSON,
		'text/javascript': parseJSON,
		'application/www-urlencoded': parseQS,
		'application/x-www-form-urlencoded': parseQS,
		'application/xml': guess,
//		'text/html': guess
	};

	// handler
	return function(req, res, next) {
		var h;
		// swallow .. and other URL quirks
		req.url = Path.normalize(req.url);
		// parse URL
		req.uri = parseUrl(req.url);
		// skip leading ? in querystring
		req.uri.search = (req.uri.search || '').substring(1);
		// honor X-Forwarded-For: possibly set by a reverse proxy
		if (h = req.headers['x-forwarded-for']) {
			if (REGEXP_IP.test(h)) {
				req.socket.remoteAddress = h;
			}
			// forget the source of knowledge
			delete req.headers['x-forwarded-for'];
		}
		// honor method override
		if (h = req.headers['x-http-method-override']) {
			req.method = h.toUpperCase();
			// forget the source of knowledge
			delete req.headers['x-http-method-override'];
		}
		// bodyful request?
		req.body = {};
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
					if (body) {
						parsers[type](body, function(err, data) {
							if (err) return next(err);
							//console.log('BODY', data);
							req.body = data;
							next();
						});
					}
					next();
				});
			//
			// formidable
			//
			} else if (type === 'multipart/form-data') {
				// setup the form reader
				var form = new Formidable.IncomingForm();
				// restrict big non-file parts
				form.maxFieldsSize = options.maxLength || 8192;
				// control ability to upload
				// TODO: current user rights?
				if (false) {
					form.onPart = function(part) {
						if (!part.filename) {
							// let formidable handle all non-file parts
							form.handlePart(part);
						}
					}
				}
				form.uploadDir = uploadDir;
				// handle file upload progress
				if (options.onUploadProgress) {
					form.on('fileBegin', function(field, file) {
						options.onUploadProgress(file, false);
						file
						.on('progress', function(received) {
							options.onUploadProgress(file);
						})
						.on('end', function() {
							options.onUploadProgress(file, true);
						})
					});
				}
				// parse the body
				form.parse(req, function(err, fields, files) {
					if (err) return next(err);
					req.body = fields;
					req.files = files;
					next();
				});
			// htmlparser
			} else if (type === 'text/html') {
				var html = new HTMLParser.DefaultHandler(function(err, dom) {
					if (err) return next(err);
					req.body = dom;
					next();
				}, {
					ignoreWhitespace: true,
					verbose: false
				});
				var parser = new HTMLParser.Parser(html);
				req.on('data', function(chunk) {
					parser.parseChunk(chunk);
				});
				req.on('error', function(err) {
					parser.done();
				});
				req.on('end', function() {
					parser.done();
				});
			} else {
				next();
			}
		//} else {
		//	return next();
		//}
	};
};
