var wget = require('./lib/wget');
wget.get('http://www.geonames.org/postalCodeLookupJSON?postalcode=17000', function(err, result){
	console.log(arguments);
});
