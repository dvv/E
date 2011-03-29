/*
var wget = require('./lib/wget');
wget.get('http://www.geonames.org/postalCodeLookupJSON?postalcode=17000', function(err, result){
	console.log(arguments);
});
*/

/*
var model = require('./model', function(err, model){
	console.log('MODEL', model);
});
*/
/*require('./model', function(err, model){
	console.log('MODEL', model);
});*/
require('./M/app')(require('./config'), function(err, security){
	console.log('S', arguments);
});
//require('repl').start('>').context.model = model;
