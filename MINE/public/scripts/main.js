'use strict';

/*
 *
 * Copyright(c) 2011 Vladimir Dronnikov <dronnikov@gmail.com>
 * MIT Licensed
 *
*/

// configure RequireJS
require({
	priority1: ['order']
});

// load scripts
// N.B. i wish knockout were based upon underscore...
require(['order!scripts/jquery.js', 'order!scripts/jquery.tmpl.min.js', 'order!scripts/knockout-latest.js', 'order!scripts/knockout.mapping-latest.debug.js', 'underscore'], function() {
	//
	// N.B. we rely on server-side logic which sets secure signed cookie called sid which holds the session
	// ugly hack -- we fetch the sid cookie and pass it as parameter to `getContext` to get the user context
	// FIXME: beautify, they work on now.js exposing the request object -- this would allow for pure server-side login
	//
	var sid = document.cookie.match(new RegExp('(?:^|;) *' + 'sid' + '=([^;]*)')); sid = sid && sid[1] || '';
	// sid is set === user logged in (or has been hacked ;)
	if (sid) {
		// establish nowjs connection
		require(['nowjs/now.js'], function() {
			// connection established ok
			now.ready(function() {
				// pass sid, server should push now.context and now.user
				//console.log('LOAD', now);
				now.getContext(sid, function() {
					// now.context holds the user capabilities
					// now.user holds the user profile
					//
					// setup the model
					//
					var model = {
						user: now.user,
						context: now.context
					};
					ko.applyBindings(model);
					console.log('NOWREADY', model);
				});
				//
				// define `now` client-side functions
				//
				now.receiveMessage = function(name, message) {
					$("#messages").append("<br>" + name + ": " + message);
				};
///
console.log('$', $);
$(document).ready(function() {

$("#send-button").click(function() {
	now.distributeMessage($("#text-input").val());
	$("#text-input").val('');
});

});
///

			});
		});
	}
});
