'use strict';

/*
 *
 * Copyright(c) 2011 Vladimir Dronnikov <dronnikov@gmail.com>
 * MIT Licensed
 *
*/

var express = require('express');
require('express-resource');
//require('express-namespace');
var app = express.createServer();

//
// simplified version of creationix/Step
//
var __slice = Array.prototype.slice;
global.Next = function(context /*, steps*/) {
	var steps = __slice.call(arguments, 1);
	var next = function(err, result) {
		var fn = steps.shift();
		if (fn) {
			try {
				fn.call(context, err, result, next);
			} catch (err) {
				next(err);
			}
		} else {
			if (err) throw err;
		}
	};
	next();
};
Next.nop = function() {};

//
// typeof quirks
//
global.typeOf = function(value) {
	var s = typeof value;
	if (s === 'object') {
		if (value) {
			if (value instanceof Array) {
				s = 'array';
			}
		} else {
			s = 'null';
		}
	// RegExp in V8 is function!
	} else if (s === 'function' && value.prototype.match) {
		s = 'object';
	}
	return s;
}

/*
app.configure(function(){
});

app.configure('development', function(){
	app.use(express.static(__dirname + '/public'));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	var oneYear = 31557600000;
	app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
	app.use(express.errorHandler());
});
*/

//
// security provider
//
var security = {
	//
	// dummy caps
	//
	// TODO: should belong to cookie-sessions
	//
	getCapability: function(uid, next){
		var context = {
			Foo: {
				query: function(ctx, query, next){
					next(null, [{c: ctx, q: query}]);
				}
			}
		};
		context.Foo = require('./auth/model/Foo');
		//console.log('CTX', context.Foo);
		// ... fill the context ...
		// set the user
		//context.user = user;
		next(null, context);
	},
	//
	// dummy authentication. should just call next() if ok
	//
	// TODO: connect-auth?
	//
	checkCredentials: function(uid, password, next){
        console.log('CREDS', arguments);
		next(null, {uid: uid});
	}
};

app.configure(function(){

	// environment flavor
	//
	// N.B. on production sites run as "NODE_ENV=production node server.js"
	//
	var debug = app.set('env') !== 'production';

	// profiler
	// N.B. DEBUG only
	if (debug) {
		app.use(express.profiler());
	}

	// parse the body to req.body, req.files; parse req.url to req.uri
	// N.B. express.bodyDecoder doesn't handle multipart forms
	app.use(require('./middleware/body')());

	// override req.method with X-HTTP-Method-Override: or req.body._method, if any
	app.use(express.methodOverride());

	// log request/response
	// N.B. DEBUG only
	if (debug) {
		app.use(require('./middleware/log')());
	}

	// manage cookie-based secure sessions
	app.use(require('cookie-sessions')({
		session_key: 'sid',			// cookie name
		secret: 'your secret here',	// application secret
		timeout: 24*60*60*1000		// cookie expiry timeout
	}));
	// handle authentication
	app.use(require('./middleware/auth').form('/auth', {
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

	// handle manually defined routes
	app.use(app.router);

	// handle RESTful access
	app.use(require('./middleware/rest')('', security.getCapability, {
		putNew: '_new',
		jsonrpc: true
	}));

	// handle chrome
	app.get('/', function(req, res, next){
		res.render('index', req.context);
	});

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
	if (debug) {
		app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
	} else {
		app.use(express.errorHandler());
	}
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
// run the server
//
// TODO: cluster, or my stereo
//
app.listen(3000);
console.log('Listening to *:3000...');
