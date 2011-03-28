'use strict';

/*
 *
 * Copyright(c) 2011 Vladimir Dronnikov <dronnikov@gmail.com>
 * MIT Licensed
 *
*/

//
// form auth + janrain auth
//
module.exports.form = function setup(mount, options){

	// setup
	if (!options) options = {};
	if (!options.validate) options.validate = function(uid, password, next){next()};
	// janrain helper
	var wget = require('../lib/wget');

	// handler
	return function handler(req, res, next){
		// check method
		if (req.method !== 'POST' || req.uri.pathname !== mount) return next();
		console.log('POSTED to /auth', req.body);
		// janrain auth?
		var token = req.body.token;
		if (token && options.apiKey) {
			wget.get('https://rpxnow.com/api/v2/auth_info?apiKey=' + options.apiKey + '&token=' + token, function(err, result){
				console.log(err, result);
				if (err) {
					return res.redirect('/failed');
				}
				console.log(result);
				//4) Use the identifier as the unique key to sign the user in to your website, and then redirect the user to the appropriate location.
			});
		} else {
			var uid = req.body.id;
			// logout
			if (!uid) {
				delete req.session;
				if (req.xhr) {
					res.send(true);
				} else {
					res.redirect('/');
				}
			// login
			} else {
				// TODO: if validate returned janrain compatible stuff, we could unify things
				options.validate(uid, req.body.password, function(err, user){
					if (err) {
						delete req.session;
						if (req.xhr) {
							res.send('Bad user', null, 403);
						} else {
							res.redirect(mount);
						}
					} else {
						req.session = {uid: uid};
						if (req.xhr) {
							res.send(req.session);
						} else {
							res.redirect('/');
						}
					}
				});
			}
		}
	};

};

//
// basic auth
//
// @validate function(user, pass, next){next(!valid(user, pass));}
//
module.exports.basic = function setup(validate){

	// setup
	var Crypto = require('crypto');

	function unauthorized(res){
		res.send('Authorization Required', {
			'WWW-Authenticate': 'Basic realm="Secure Area"',
			'Content-Type': 'text/plain; charset=UTF-8'
		}, 401);
	}

	// handler
	return function(req, res, next){
		// FIXME: only allow for localhost or HTTPS connection
		//if (req.socket.remoteAddress === '127.0.0.1' && req.headers.authorization) {
		if (req.headers.authorization) {
			var parts = req.headers.authorization.split(' ');
			parts = (new Buffer(parts[1], 'base64')).toString('utf8').split(':');
			var uid = parts[0];
			var password = parts[1];
			// validate secret
			validate(uid, password, function(err, user){
				if (err) return unauthorized(res);
				// pass if auth is ok
				next();
			});
		} else {
			unauthorized(res);
		}
	};

};
