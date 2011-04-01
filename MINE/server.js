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
// run cluster
//
var server = require('stereo')(null, config.server);

//
// worker process
//
if (server) {

	//
	// inter-workers message arrives
	//
	process.on('message', function(message){
		console.log(JSON.stringify(message));
	});

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
		// setup middleware
		//
		var Middleware = require('./middleware');
		deepCopy({
			// signup function
			signup: security.signup,
			// get capability
			getCapability: security.getCapability,
			// native authentication
			validate: security.checkCredentials
		}, config.security);
		var middleware = Middleware.vanilla(config);
		server.on('request', middleware);
		// TODO: reuse for HTTPS

	});

//
// master process
//
} else {

	//
	// broadcast a message
	//
	setTimeout(function(){process.publish({sos: 'to all, all, all'});}, 2000);

}
