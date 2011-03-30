'use strict';

/*
 *
 * Copyright(c) 2011 Vladimir Dronnikov <dronnikov@gmail.com>
 * MIT Licensed
 *
*/

//
// form based authentication, with optional OpenID brokers support
//
module.exports.form = function setup(mount, options){

	// setup
	if (!options) options = {};

	// OpenID providers
	var openid = [];
	// loginza.ru
	if (options.loginza) {
		openid.push({
			name: 'loginza',
			referrer: /^http:\/\/loginza.ru\/api\/redirect\?/,
			getUrl: function(token){
				return 'http://loginza.ru/api/authinfo?token=' + token;
			}
		});
	}
	// janrain.com
	if (options.janrain) {
		openid.push({
			name: 'janrain',
			referrer: new RegExp('^http:\/\/' + options.janrain.domain + '.rpxnow.com\/redirect\?'),
			getUrl: function(token){
				return 'https://rpxnow.com/api/v2/auth_info?apiKey=' + options.janrain.apiKey + '&token=' + token;
			}
		});
	}
	
	// HTTP GET helper
	var wget = require('../lib/wget');

	// handler
	return function handler(req, res, next){

		if (req.uri.pathname !== mount) return next();

		// GET -- render authentication page
		if (req.method === 'GET') {
			res.render('auth', {
				janrain: {
					domain: options.janrain.domain
				},
				tokenUrl: escape('http://dvv.dyndns.org:3000/auth&lang=ru')
				//http%3A%2F%2Fdvv.dyndns.org%3A3000%2Fauth&lang=ru
			});
			return;
		}

		// POST -- handle the input
		if (req.method !== 'POST') return next();
		//console.log('POSTED to /auth', req.body, req.headers);

		// authentication helper
		var authenticate = function(err, result){
			//console.log('WGOT', err, result, result.user);
			// failed? -> remove req.session
			if (!result) {
				delete req.session;
			// ok? -> set req.session
			} else {
				// TODO: signup unless user exists, and pull info from profile
				// native form?
				if (result.user) {
					req.session = {uid: result.user.id};
					// ...
				// loginza?
				} else if (result.identity) {
					// ...
				// janrain?
				} else if (result.stat === 'ok' && result.profile) {
					// ...
				}
				//console.log(result); //preferredUsername, displayName, photo
				//var uid = 'DUMMYSOFAR';//result.profile.verifiedEmail;
			}
			console.log('SESS', req.session);
			// respond, honoring AJAX
			if (req.xhr) {
				res.send(req.session);
			} else {
				// FIXME: shouldn't be `mount`?
				res.redirect('/');
			}
		};

		// got auth token from OpenID providers?
		var token = req.body.token;
		// OpenID provider
		if (token) {
			var referrer = req.header('referrer');
			// try first matching provider
			for (var i = 0; i < openid.length; i++) {
				var provider = openid[i];
				if (referrer.match(provider.referrer)) {
					wget.get(provider.getUrl(token), authenticate);
					return;
				}
			}
			// unknown or forged provider --> force logout
			authenticate();
		// native form login
		} else if (options.validate) {
			options.validate(req.body.id, req.body.password, authenticate);
		// no authentication provider
		} else {
			next();
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
