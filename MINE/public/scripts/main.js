'use strict';

/*
 *
 * Copyright(c) 2011 Vladimir Dronnikov <dronnikov@gmail.com>
 * MIT Licensed
 *
*/

// configure RequireJS
require({
	//priority: ['order']
});

// augment IE. for how long?!
if (typeof console == 'undefined') console = {log: alert};

// load scripts
// N.B. i wish knockout were based upon underscore...
//require(['order!scripts/jquery.js', 'order!scripts/jquery.tmpl.min.js', 'order!scripts/knockout-latest.js', 'order!scripts/knockout.mapping-latest.debug.js', 'underscore'], function() {
//require(['underscore'], function() {
require([], function() {
	//
	// N.B. we rely on server-side logic which sets secure signed cookie called sid which holds the session
	// ugly hack -- we fetch the sid cookie and pass it as parameter to `getContext` to get the user context
	// FIXME: beautify, they work on now.js exposing the request object -- this would allow for pure server-side login
	//
	var sid = document.cookie.match(new RegExp('(?:^|;) *' + 'sid' + '=([^;]*)')); sid = sid && sid[1] || '';
	// sid is set === user logged in (or has been hacked ;)
	//if (sid) {
		// establish nowjs connection
		require(['nowjs/now.js'], function() {
			// connection established ok
			now.ready(function() {
				// pass sid, server should push now.context and now.user
				//console.log('LOAD', now);
				now.getContext(sid, function(data) {
					console.log('CTX', data.schema);
					// now.context holds the user capabilities
					// now.user holds the user profile
					//
					// setup the model
					//
	var model = window.model = {
		user: now.user,
		context: now.context,
		entity: ko.observable(),
		error: ko.observable(),
		result: ko.observable(),
		listEntity: function(entity) {
			console.log('LE', arguments);
			CALL(entity, 'query', '');
		},
		getEntity: function(entity, id) {
			console.log('GE', arguments);
			CALL(entity, 'get', id);
		}
	};
	ko.applyBindings(model);
					//
					// setup RPC helper
					//
					var CALL = window.CALL = function(entity, method) {
						function setError(err) {
							if (err) {
								if (typeof err === 'string') err = {message: err};
								if (!Array.isArray(err)) err = [err];
							}
							// TODO: beautify
							model.error(err);
						}
						model.entity(entity);
						var params = Array.prototype.slice.call(arguments, 2);
						var promise = $.Deferred();
						params.push(function(err, result) {
							//model.set({error: err || null, result: err ? null : (result || null)});
							console.log('RET', err, result);
							setError(err || null);
							model.result(err ? null : (result ? (Array.isArray(result) ? result : [result]) : null));
							promise.resolve();
						});
						try {
							model.context[entity][method].apply(null, params);
						} catch (err) {
							if (err instanceof TypeError) err = 'Forbidden'; else err = err.message || err;
							//console.log('EXC', err);
							setError(err);
							model.result(null);
							promise.resolve();
						}
						return promise;
					};

///
require.ready(function() {

	// views
	console.log('DOMREADY', now.context.Admin);

$("#send-button").click(function() {
	now.distributeMessage($("#text-input").val());
	$("#text-input").val('');
});

});

				});
				//
				// define `now` client-side functions
				//
				now.receiveMessage = function(name, message) {
					$("#messages").append("<br>" + name + ": " + message);
				};
///

			});
		});
	//}
});
