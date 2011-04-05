'use strict';

/*
 *
 * Copyright(c) 2011 Vladimir Dronnikov <dronnikov@gmail.com>
 * MIT Licensed
 *
*/

var Crypto = require('crypto');
function sha1(data, key) {
	var hmac = Crypto.createHmac('sha1', '');
	hmac.update(data && String(data) || '');
	return hmac.digest('hex');
}

//
// form based authentication, with optional OpenID brokers support
//
// if options.signup = function(data, callback) is given, self-registration is allowed
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
			getUrl: function(token) {
				return 'http://loginza.ru/api/authinfo?token=' + token;
			}
		});
	}
	// janrain.com
	if (options.janrain) {
		openid.push({
			name: 'janrain',
			referrer: new RegExp('^http:\/\/' + options.janrain.domain + '.rpxnow.com\/redirect\?'),
			getUrl: function(token) {
				return 'https://rpxnow.com/api/v2/auth_info?apiKey=' + options.janrain.apiKey + '&token=' + token;
			}
		});
	}
	
	// HTTP GET helper, to query OpenID provider
	var wget = require('../lib/wget');

	// handler
	return function handler(req, res, next) {

		//
		// get current user capabilities
		//
		if (options.getCapability && !req.context) {
			// N.B. map all falsy user ids to uid=''
			options.getCapability(req.session && req.session.uid || '', function(err, context) {
				req.context = context;
				// rerun the handler with `req.context` set
				handler(req, res, next);
			});
			return;
		}

		//
		// check we are in business
		//
		if (req.uri.pathname !== mount) return next();

		//
		// GET -- render authentication page
		//
		if (req.method === 'GET') {
			// FIXME: render means express?
			res.render('auth', {
				janrain: {
					domain: options.janrain.domain
				},
				loginza: options.loginza,
				tokenUrl: encodeURI(options.signinURL),
				signup: Boolean(options.signup)
			});
			return;
		}

		//
		// POST -- handle the input
		//
		if (req.method !== 'POST') return next();
		//console.log('POSTED to /auth', req.body, req.headers);

		// FIXME: BROKEN...

		// authentication helper
		function authenticate(err, uid) {
			console.log('AUTHENTICATE', err && err.stack || err, uid);
			// no such user or logout? -> remove req.session
			if (err || !uid) {
				// FIXME: instead set a flash with error?
				delete req.session;
			// ok? -> set req.session.uid
			} else {
				console.log('SIGNEDIN', uid);
				if (!req.session) req.session = {};
				req.session.uid = uid;
			}
			console.log('SESS', req.session);
			/*require('../lib/email').mail('dvv854@gmail.com', 'login', 'loggedinfrom' + req.socket.remoteAddress, function(err) {
				if (err) console.log('MAILERR', err.stack||err);
				res.redirect(req.session ? '/' : mount);
			});*/
			res.redirect(req.session ? '/' : mount);
		}

		// another authentication helper
		function validateOrSignup(data) {
			console.log('VALIDATE', data);
			// if password is given, use it
			// else check if user exists
			options.validate(data.id, data.password || false, function(err) {
				console.log('VALIDATED?', err);
				// no such user? -> try to signup (if enabled)
				if (err === 'usernotfound' && options.signup) {
					options.signup(data, function(err, user) {
						authenticate(err, data.id);
					});
				// user exists and is validated by provider
				} else if (!err || (err === 'userinvalid' && !data.password)) {
					authenticate(null, data.id);
				// other error -> logout
				} else {
					authenticate();
				}
			});
		}

		// got auth token from OpenID providers?
		var token = req.body.token;
		// OpenID provider
		if (token) {
			var referrer = req.headers.referer || req.headers.referrer || '';
			// try first matching provider
			for (var i = 0; i < openid.length; i++) {
				var provider = openid[i];
				if (referrer.match(provider.referrer)) {
					wget.get(provider.getUrl(token), function(err, result) {
						console.log('WGOT', arguments);
						// error? -> logout
						if (err) return authenticate();
						// got user profile
						// signup unless user exists, and copy info from profile
						//
						// loginza?
						//
						if (provider.name === 'loginza' && result.identity) {
							var profile = result;
							var uid = sha1(profile.identity);
							var data;
							// twitter
							if (profile.provider === 'http://twitter.com/') {
								data = {
									id: uid,
									name: profile.name && profile.name.full_name || undefined,
									email: profile.email,
									photo: profile.photo
								};
							// google
							} else if (profile.provider === 'https://www.google.com/accounts/o8/ud') {
								data = {
									id: uid,
									name: profile.name && profile.name.full_name || undefined,
									email: profile.email,
									photo: profile.photo
								};
							// vkontakte.ru
							} else if (profile.provider === 'http://vkontakte.ru/') {
								data = {
									id: uid,
									name: profile.name && (profile.name.first_name + ' ' + profile.name.last_name) || undefined,
									email: profile.email,
									photo: profile.photo
								};
							// other providers
							// TODO: try
							} else {
								data = {
									id: uid,
									name: profile.name && profile.name.full_name || profile.name,
									email: profile.email,
									photo: profile.photo
								};
							}
							// ...
						//
						// janrain?
						//
						} else if (provider.name === 'janrain' && result.stat === 'ok' && result.profile) {
							var profile = result.profile;
							var uid = sha1(profile.identifier); //url?
							var data;
							// twitter
							if (profile.providerName === 'Twitter') {
								data = {
									id: uid,
									name: profile.displayName || undefined,
									email: profile.email,
									photo: profile.photo
								};
							// facebook
							} if (profile.providerName === 'Facebook') {
								data = {
									id: uid,
									name: profile.displayName || undefined,
									email: profile.verifiedEmail || profile.email,
									photo: profile.photo
								};
							// google
							} if (profile.providerName === 'Google') {
								data = {
									id: uid,
									name: profile.name.formatted || undefined,
									email: profile.verifiedEmail || profile.email,
									photo: profile.photo
								};
							// TODO: other providers
							} else {
								// ...
							}
						// TODO: other brokers
						} else {
						}
						console.log('TOCREATE', data);
						//
						// try to find local user authenticated by an OpenID provider
						//
						if (data) {
							validateOrSignup(data);
						// not authenticated by brokers -> logout
						} else {
							authenticate();
						}
					});
					return;
				}
			}
			// unknown or forged provider --> force logout
			authenticate();
		// native form login
		} else if (options.validate) {
			var data = req.body;
			// check if password is confirmed at signup
			if (data.signup && data.password && data.password2 === data.password) {
				validateOrSignup(data);
			// check if password is given at sigin
			} else if (data.signin && data.password) {
				validateOrSignup(data);
			// else logout
			} else {
				authenticate();
			}
		// no authentication provider
		} else {
			next();
		}

	};

};

//
// basic auth. original: creationix/creationix
//
// @validate function(user, pass, next){next(!valid(user, pass));}
//
module.exports.basic = function setup(validate) {

	// setup

	function unauthorized(res) {
		res.send('Authorization Required', {
			'WWW-Authenticate': 'Basic realm="Secure Area"',
			'Content-Type': 'text/plain; charset=UTF-8'
		}, 401);
	}

	// handler
	return function(req, res, next) {
		// FIXME: only allow for localhost or HTTPS connection
		//if (req.socket.remoteAddress === '127.0.0.1' && req.headers.authorization) {
		if (req.headers.authorization) {
			var parts = req.headers.authorization.split(' ');
			parts = (new Buffer(parts[1], 'base64')).toString('utf8').split(':');
			var uid = parts[0];
			var password = parts[1];
			// validate secret
			validate(uid, password, function(err){
				if (err) return unauthorized(res);
				// pass if auth is ok
				next();
			});
		} else {
			unauthorized(res);
		}
	};

};
