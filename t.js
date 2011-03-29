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
var model = require('./model');
process.on('dbready', function(model){
	console.log('MODEL', model);
});
//console.log('U', _.rql);
//setInterval(function(){console.log('MODEL', model)},100);
//Object.defineProperty(require('repl').start('>').context, 'model', {get: function(){return require('./model');}, enumerable: true});
require('repl').start('>').context.model = model;
