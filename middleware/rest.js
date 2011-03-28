'use strict';

/*
 *
 * Copyright(c) 2011 Vladimir Dronnikov <dronnikov@gmail.com>
 * MIT Licensed
 *
*/

var Url = require('url'),
		Fs = require('fs'),
		Path = require('path');

//
// ReST resource routing
//
module.exports = function setup(root, getCapabilityFn, options){

	// setup
	options = options || {};

	// cache for contexts
	var cache = {};

	// normalize mount points to always end in /
	if (root[root.length - 1] !== '/') { root += '/'; }

	// whether to PUT /Foo/_new calls Foo.add()
	var brandNewID = options.putNew ? options.putNew : {};

	// handler
	return function handler(req, res, next) {
		// parse out pathname if it's not there already (other middleware may have done it already)
		//if (!req.hasOwnProperty('uri')) { req.uri = Url.parse(req.url); }

		// mount relative to the given root
		var path = req.uri.pathname;
		if (path.substr(0, root.length) !== root) { return next(); }

		// get the requested controller and method
		var parts = path.substr(root.length).split('/').map(function(p){return decodeURIComponent(p)});
		if (parts[parts.length - 1] === '') { parts.pop(); } // N.B. trailing slash is noop

		//process.log('PARTS', parts);

		// find the resource
		var resource = parts[0];

		Next({},
			//
			// get context
			//
			function(err, result, step){
				// N.B. map all falsy users to uid=''
				var uid = req.session && req.session.uid || '';
				// cached context?
				// TODO: how to invalidate? setInterval() reaper?
				if (cache.hasOwnProperty(uid)) {
					step(null, cache[uid]);
				// get and cache context
				} else {
					getCapabilityFn(uid, function(err, context){
						// N.B. don't cache negatives
						if (context) {
							step(null, cache[uid] = context);
						} else {
							step(err);
						}
					});
				}
			},
			//
			// determine the handler method and parameters
			//
			function(err, context, step){
				//if (err) return step(err);
				if (!context) context = {};
				req.context = context;
				//
				var method = req.method;
				var id = parts[1];
				var m, p;
				//
				// query resource
				//
				if (method === 'GET') {
					m = 'get';
					// get by ID
					if (id && id !== brandNewID) {
						p = [id];
					// query
					} else {
						m = 'query';
						// bulk get via POST X-HTTP-Method-Override: GET
						if (Array.isArray(req.body)) {
							p = [req.body];
						// query by RQL
						} else {
							p = [req.uri.search];
						}
					}
				//
				// create new / update resource
				//
				} else if (method === 'PUT') {
					m = 'update';
					if (id) {
						// add new
						if (id === brandNewID) {
							m = 'add';
							p = [req.body];
						// update by ID
						} else {
							p = [id, req.body];
						}
					} else {
						// bulk update via POST X-HTTP-Method-Override: PUT
						if (Array.isArray(req.body) && Array.isArray(req.body[0])) {
							p = [req.body[0], req.body[1]];
						// update by RQL
						} else {
							p = [req.uri.search, req.body];
						}
					}
				//
				// remove resource
				//
				} else if (method === 'DELETE') {
					m = 'remove';
					if (id && id !== brandNewID) {
						p = [id];
					} else {
						// bulk remove via POST X-HTTP-Method-Override: DELETE
						if (Array.isArray(req.body)) {
							p = [req.body];
						// remove by RQL
						} else {
							p = [req.uri.search];
						}
					}
				//
				// arbitrary RPC to resource
				//
				} else if (method === 'POST') {
					// doesn't respond to POST
					if (options.putNew) {
						// RPC
						// TODO: try context[resource].rpc[req.body.method].apply(context, req.body.params, step)
					} else {
						// add
						m = 'add';
						p = [req.body];
					}
				//
				// get capabilities of resource
				//
				} else if (method === 'OPTIONS') {
					// enlist resource own methods
					/*
					resource = resource ? context[resource] : context;
					var methods = [];
					for (var key in resource) {
						var value = resource[key];
						process.log(parts[0], key);
						if (resource.hasOwnProperty(key) && value) {// && typeof value.apply === 'function') {
							// TODO: filter out 'private' methods?
							methods.push(key);
						}
					}
					return step(null, methods);
					*/
				//
				// unsupported verb
				//
				} else {
				}

				// debug
				//return res.send([resource, m, p]);

				//
				// find the resource
				//
				if (!context.hasOwnProperty(resource)) { return next(); }
				resource = context[resource];
				// bail out if method is unsupported
				if (!resource.hasOwnProperty(m)) { return step(options.jsonrpc ? 'notsupported' : 405); }
				//
				// call the handler. signature is fn(context, p..., step)
				//
				var args = p;
				args.unshift(context);
				args.push(step);
				resource[m].apply(null, args);
			},
			//
			// wrap the response to JSONRPC format if specified
			//
			function(err, result, step){
				var response;
				if (options.jsonrpc) {
					response = {
						result: null,
						error: null,
						//id: req.body.id
					};
					if (err) {
						response.error = err.message || err;
					} else if (result === void 0) {
						response.result = true;
					} else {
						response.result = result;
					}
					res.send(response);
				// plain response
				} else {
					if (err) {
						res.send(err.message || err, null, 406);
					} else {
						res.send(result);
					}
				}
			}
		);

	};

};
