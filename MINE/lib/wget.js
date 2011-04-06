'use strict';

/*
 *
 * Copyright(c) 2011 Vladimir Dronnikov <dronnikov@gmail.com>
 * MIT Licensed
 *
*/

var parseUrl = require('url').parse;
var bodyParser = require('../middleware/body')();

var proto = {
	'http:': {
		port: 80,
		module: require('http')
	},
	'https:': {
		port: 443,
		module: require('https')
	}
};

function get(url, headers, next) {
	// defaults
	if (!next) {
		next = headers;
		headers = null;
	}
	if (!headers) {
		headers = {
			accept: '*/*',
			'user-agent': 'wget 1.14'
		}
	}
	// compose request params
	var params = parseUrl(url);
	var protocol = params.protocol;
	params = {
		host: params.hostname,
		port: params.port || proto[protocol].port || 3128,
		path: params.pathname + (params.search ? params.search : ''),
		headers: headers
	};
	// proxy?
	var proxy;
	if (proxy = process.env['' + protocol.replace(/\:$/,'') + '_proxy'] || process.env.http_proxy) {
		proxy = parseUrl(proxy);
		protocol = proxy.protocol;
		params.headers.host = params.host;
		params.port = proxy.port || 80;
		params.host = proxy.hostname;
		params.path = url;
	}
	params.method = 'GET';
	//console.log('REQ', params);
	// issue the request
	var request = proto[protocol].module.request(params, function(req) {
		// reuse body middleware to parse the response
		bodyParser(req, null, function(err, result) {
			next(err, req.body);
		});
	});
	request.end();
}

function post(url, data, headers, next) {
	// defaults
	if (!next) {
		next = headers;
		headers = null;
	}
	if (!headers) {
		headers = {
			accept: '*/*',
			'user-agent': 'wget 1.14'
		}
	}
	// compose request params
	var params = parseUrl(url);
	var protocol = params.protocol;
	params = {
		host: params.hostname,
		port: params.port || proto[protocol].port || 3128,
		path: params.pathname + (params.search ? params.search : ''),
		headers: headers
	};
	// proxy?
	var proxy;
	if (proxy = process.env['' + protocol.replace(/\:$/,'') + '_proxy'] || process.env.http_proxy) {
		proxy = parseUrl(proxy);
		protocol = proxy.protocol;
		params.headers.host = params.host;
		params.port = proxy.port || 80;
		params.host = proxy.hostname;
		params.path = url;
	}
	params.method = 'POST';
	console.log('REQ', params);
	// issue the request
	var request = proto[protocol].module.request(params, function(req) {
		// reuse body middleware to parse the response
		bodyParser(req, null, function(err, result) {
			next(err, req.body);
		});
	});
	request.write(data, 'utf8');
	request.end();
}

module.exports = {
	get: get,
	post: post
};
