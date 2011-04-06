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

//
// setup application
//
var config = require('./config');
Next(null, function(err, result, next) {

	//
	// get the data model
	//
	require('./model')(config, next);

}, function(err, model, next) {

	//console.log('S1', arguments);

	//
	// setup middleware
	//
	var Middleware = require('./middleware');
	deepCopy({
		// signup function
		signup: config.security.selfSignup ? model.signup : undefined,
		// get capability
		getCapability: model.getCapability,
		// native authentication
		checkCredentials: model.checkCredentials
	}, config.security);
	function ordinary(req, res, next) {
		var user = req.context.user;
		user = {
			id: user.id,
			type: user.type,
			email: user.email,
			name: user.name,
			roles: user.roles
		};

		if (req.method === 'POST') {
			console.log('POSTED');
			var Qs = require('querystring');
			var qry = Qs.stringify({
				privatekey: config.security.recaptcha.privkey,
				remoteip: req.socket.remoteAddress,
				challenge: req.body.recaptcha_challenge_field,
				response: req.body.recaptcha_response_field
			});
			var url = 'http://www.google.com/recaptcha/api/verify';
			var Wget = require('./lib/wget');
			Wget.post(url, qry, {}, function(err, result) {
				console.log('CAPTCHED', arguments);
			});
			res.render('index', {user: user, fields: req.body, files: req.files, form: {recaptchaKey: config.security.recaptcha.pubkey}});
		} else {
			res.render('index', {user: user, fields: req.body, files: req.files, form: {recaptchaKey: config.security.recaptcha.pubkey}});
		}
	}
	var routes = [
		['/', {get: ordinary, post: ordinary}],
		['GET', '/profile', ordinary],
	];
	config.routes = routes;
	var middleware = Middleware.vanilla(__dirname, config);
	next(null, middleware);

}, function(err, middleware, next) {

	if (err) console.log('S2', arguments);

	/***
	var http = require('http').createServer();
	http.on('request', middleware);

	var cluster = require('cluster');
	cluster(http)
		.set('workers', 2)
		.use(cluster.debug())
		.use(cluster.reload([__filename, 'lib', 'middleware']))
		.use(cluster.stats())
		.use(cluster.repl())
		.listen(3000);
	return;

	var fugue = require('fugue');
	fugue.start(http, 3000, null, 2, {
		tmp_path: __dirname + '/tmp',
		daemonize: false,
		log_file: __dirname + '/tmp/children.txt',
		master_log_file: __dirname + '/tmp/master.txt',
		//uid: 'pedroteixeira',
		//gid: 'staff',
		//working_path: '/tmp',
		verbose: true,
		//master_pid_path: '/tmp/fugue_master.pid'
	});
	return;
	***/

	//
	// run both HTTP(S) servers with the same middleware
	//
	var http = require('http').createServer();
	http.on('request', middleware);
	http.listen(3000);
	//var https = require('https').createServer({
	//	key: require('fs').readFileSync('key.pem', 'utf8'),
	//	cert: require('fs').readFileSync('cert.pem', 'utf8')
	//});
	//https.on('request', middleware);
	//https.listen(4000);
	return;

	//
	// run cluster
	//
	var server = require('stereo')(null, config.server);

	//
	// worker process
	//
	if (server) {

		// inter-workers message arrives
		process.on('message', function(message){
			process.log(JSON.stringify(message));
		});

		// attach middleware
		server.on('request', middleware);

	//
	// master process
	//
	} else {

		// broadcast a message
		setTimeout(function(){process.publish({sos: 'to all, all, all'});}, 2000);

	}

});
