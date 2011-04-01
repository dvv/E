'use strict';

/*
 *
 * Copyright(c) 2011 Vladimir Dronnikov <dronnikov@gmail.com>
 * MIT Licensed
 *
*/

////////////////////////////////////////////////////////////

require('./lib/helpers');

////////////////////////////////////////////////////////////

var config = require('./config');

//
// setup application
//
Next(null, function(err, result, next) {

	//
	// get the data model
	//
	require('./model')(config, next);

}, function(err, security, next) {

	//console.log('S', arguments);

	//
	// create server
	//
	var express = require('express');
	require('express-resource');
	//require('express-namespace');
	var app = express.createServer();

	//
	// define server middleware
	//
	app.configure(function() {

		// environment flavor
		//
		// N.B. on production sites run as "NODE_ENV=production node server.js"
		//
		var debug = app.set('env') !== 'production';

		// profiler
		// N.B. DEBUG only
		if (debug) {
			//app.use(express.profiler());
		}

		// parse the body to req.body, req.files; parse req.url to req.uri
		// N.B. express.bodyDecoder doesn't handle multipart forms
		// TODO: csrf https://github.com/hanssonlarsson/express-csrf
		app.use(require('./middleware/body')());

		// override req.method with X-HTTP-Method-Override: or req.body._method, if any
		app.use(express.methodOverride());

		// log request/response
		// N.B. DEBUG only
		if (debug) {
			//app.use(require('./middleware/log')());
		}

		// manage cookie-based secure sessions
		app.use(require('cookie-sessions')(config.security.session));
		// handle authentication
		app.use(require('./middleware/auth').form('/auth', {
			// auth URL
			signinURL: 'http://dvv.dyndns.org:3000/auth',
			// signup function
			signup: security.signup,
			// get capability
			getCapability: security.getCapability,
			// native authentication
			validate: security.checkCredentials,
			// loginza.ru authentication
			loginza: true,
			// janrain.com authentication
			janrain: {
				domain: 'dvv',
				apiKey: 'cce43a9bb39074792db57c01edaf4aa61e4b158f'
			}
		}));

		// get current user capabilities
		//app.use(require('./middleware/caps')(security.getCapability));

		// handle manually defined routes
		app.use(app.router);

		// handle RESTful access
		app.use(require('./middleware/rest')('', {
			putNew: '_new',
			jsonrpc: true
		}));

		//app.use(express.compiler(src: 'src', dest: 'lib', enable: ['coffeescript']));
		// serve static files under ./public directory
		app.use(express.static(__dirname + '/public'));

		// so far just dump the request
		//app.use(function(req, res, next){res.send(req.session);});

		// TODO: setup custom exception handler -- should emit tickets and return their href
		/*
		app.error(function(err, req, res, next){
		});*/

		// nicely catch exceptions
		app.use(express.errorHandler({dumpExceptions: debug, showStack: debug}));

	});

	//
	// add non-standard resources
	//
	// TODO: express-namespace?
	//
	app.resource('forums', require('./res'));
	app.resource('a/a', require('./res'));

	//
	// setup view rendering
	//
	app.register('.html', require('ejs'));
	app.set('view engine', 'html');
	/*app.set('view options', {
		open: '{{',
		close: '}}'
	});*/

	//
	// handle chrome
	//
	app.get('/', function(req, res, next) {
		res.render('index', req.context);
	});

	//
	//
	//
	next(null, app);
	require('repl').start('node> ').context.app = security;

}, function(err, app, next) {

	//console.log('A', err, app);

	//
	// run the server
	//
	// TODO: cluster, or my stereo
	//
	if (false) {
	var cluster = require('cluster');
	cluster(app)
		.set('workers', 1)
		.use(cluster.debug())
		.use(cluster.reload([__filename, 'middleware']))
		.use(cluster.stats())
		.use(cluster.repl(30000))
		.listen(3000);
	} else {
		app.listen(config.server.port);
		console.log('Listening to *:3000...');
	}
});
