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
		watch: ['*.js', 'public', 'views', 'lib'],
		stackTrace: true
	},
	security: {
		//bypass: true,
		session: {
			session_key: 'sid',			// cookie name
			secret: 'your secret here',	// application secret
			timeout: 24*60*60*1000		// cookie expiry timeout
		},
		mount: '/auth',
		signinURL: 'http://dvv.dyndns.org:3000/auth',
		loginza: true,
		janrain: {
			domain: 'dvv',
			apiKey: 'cce43a9bb39074792db57c01edaf4aa61e4b158f'
		},
		userTypes: {
			admin: 'Admin',
			affiliate: 'Affiliate'
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
