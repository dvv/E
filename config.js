'use strict';

module.exports = {
	server: {
		port: 3000,
		/*ssl: {
			key: 'key.pem',
			cert: 'cert.pem'
		},*/
		shutdownTimeout: 10000,
		repl: true,
		pub: {
			dir: '../public',
			ttl: 3600
		},
		watch: ['*.js', 'public', 'templates', '../lib'],
		stackTrace: true
	},
	security: {
		//bypass: true,
		session: {
			session_key: 'sid',			// cookie name
			secret: 'your secret here',	// application secret
			timeout: 24*60*60*1000		// cookie expiry timeout
		},
		url: '/auth',
		userTypes: {
			affiliate: 'Affiliate',
			admin: 'Admin'
		},
		root: {
			id: 'root',
			email: 'place-admin@here.com',
			password: '123',
			type: 'root'
		}
	},
	database: {
		url: ''
	},
	upload: {
		dir: 'upload'
	},
	defaults: {
		nls: 'en',
		currency: 'usd'
	}
};
