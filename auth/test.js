'use strict';

var user = {
	id: 'aaa',
	roles: ['admin', 'user']
};

var getContext = require('./');
//console.log('MODEL', model);

for (var i = 0; i < 4; ++i) {
	//getContext(user, console.log);
	getContext(user, function(err, context){
		//context.Foo.query('', function(){});//console.log);
		context.Foo.query('', console.log);
	});
}
