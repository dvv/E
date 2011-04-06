'use strict';

module.exports = {
	server: {
		port: 3000,
		//workers: 2,
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
		selfSignup: true,
		userTypes: {
			admin: 'Admin',
			affiliate: 'Affiliate'
		},
		recaptcha: {
			pubkey: '6LcYML4SAAAAAMrP_hiwsXJo3FtI21gKiZ1Jun7U',
			privkey: '6LcYML4SAAAAAPby-ghBSDpi97JP1LYI71O-J6kx'
		}
	},
	database: {
		url: ''
	},
	upload: {
		dir: 'upload'
	},
	smtp: {
		user: 'dvv',
		pass: 'XticrjtGbdj',
		host: '172.23.231.73',
		port: 2525,
		ssl: false,
		tls: false,
		from: 'dvv@archonsoftware.com'
	},
	defaults: {
		nls: 'en',
		currency: 'usd'
	}
};
