'use strict';

/*
 *
 * Copyright(c) 2011 Vladimir Dronnikov <dronnikov@gmail.com>
 * MIT Licensed
 *
*/

require('../lib/helpers');

//
// improve HTTP request and response
//
require('./response');

//
// error handler uses improved res.send
//
function errorHandler(req, res, err) {
	if (err) {
		console.error('\n' + (err.stack || err) + '\n');
		res.send(err);
	} else {
		// 404 = not found
		res.send(null);
	}
};

//
// bundled creationix/Stack
//
var Middleware = function Stack(/*layers*/) {
	var error = errorHandler;
	var handle = error;
	Array.prototype.slice.call(arguments).reverse().forEach(function (layer) {
		var child = handle;
		handle = function (req, res) {
			try {
				layer(req, res, function (err) {
					if (err) { return error(req, res, err); }
					child(req, res);
				});
			} catch (err) {
				error(req, res, err);
			}
		};
	});
	return handle;
}

//
// plugin middleware helpers
//
extend(Middleware, {

	// parse the body into req.body
	body: require('./body'),

	// manage secure signed cookie which holds logged user id
	session: require('cookie-sessions'),

	// handle form/OpenID auth
	auth: require('./auth').form,
	// handle basic authentication
	authBasic: require('./auth').basic,

	// mount a handler onto a URI (and optionally HTTP verb)
	mount: require('./mount'),

	// serve static stuff
	'static': require('./static'),

	// MVC style controllers
	mvc: require('./mvc'),

	// ReST resource controller
	rest: require('./rest'),

	// log the request and corresponding response
	log: require('./log'),

});

//
// generate standard middleware stack
//
Middleware.vanilla = function(options) {

	if (!options) options = {};
	var layers = [];

	function use(layer) { layers.push(layer); }

	// parse the body to req.body, req.files; parse req.url to req.uri
	// TODO: csrf https://github.com/hanssonlarsson/express-csrf
	use(Middleware.body());

	use(function(req, res, next) {
		res.send(req.body);
	});

	// security
	if (options.security) {
		// manage cookie-based secure sessions
		use(Middleware.session(options.security.session));
		// handle authentication
		use(Middleware.auth(options.security.mount, {
			// auth URL
			signinURL: options.security.signinURL,
			// signup function
			signup: options.security.signup,
			// get capability
			getCapability: options.security.getCapability,
			// native authentication
			validate: options.security.checkCredentials,
			// loginza.ru authentication
			loginza: options.security.loginza,
			// janrain.com authentication
			janrain: options.security.janrain
		}));
	}

	// handle manually defined routes
	if (options.routes) {
		routes.forEach(function(route) {
			use(Middleware.mount.apply(Middleware.mount, route));
		});
	}

	// ReST/JSON-RPC handler
	use(Middleware.rest('', {
		putNew: '_new',
		jsonrpc: true
	}));

	// serve static stuff under ./public
	use(Middleware.static('/', __dirname + '/public', null, {
		//cacheMaxFileSizeToCache: 1024, // set to limit the size of cacheable file
	}));

	//
	return Middleware.apply(Middleware, layers);

};

//
// expose
//
module.exports = Middleware;
