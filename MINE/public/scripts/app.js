'use strict';

/*
 *
 * Copyright(c) 2011 Vladimir Dronnikov <dronnikov@gmail.com>
 * MIT Licensed
 *
*/

/*

http://stackoverflow.com/questions/4776261/views-within-views-how-to-generating-lists-of-items-with-backbone-js

/					- member zone, dashboard
/#profile	- profile
/admin		- admin zone, list/edit entities
/auth			- signup/singin/recovery, whatever security

*/

// augment IE. for how long?!
if (typeof console == 'undefined') console = {log: alert};

$(document).ready(function() {
	console.log('DOMREADY');
	//
	// misc helpers
	//
	_.mixin({
		partial: function(templateIds, data){
			if (!_.isArray(templateIds)) {
				templateIds = [templateIds, 'notfound'];
			}
			var text = null;
			_.each(templateIds, function(tid){
				//console.log('PART?', tid);
				var t = $('#tmpl-'+tid);
				if (t && !text) {
					text = t.text();
					//console.log('PART!', text);
				}
			});
			return text ? _.template(text, data) : '';
			//return text ? $.tmpl(text, data) : [];
		}
	});
	//
	// N.B. we rely on server-side logic which sets secure signed cookie called sid which holds the session
	// ugly hack -- we fetch the sid cookie and pass it as parameter to `getContext` to get the user context
	// FIXME: beautify, they work on now.js exposing the request object -- this would allow for pure server-side login
	//
	var sid = document.cookie.match(new RegExp('(?:^|;) *' + 'sid' + '=([^;]*)')); sid = sid && sid[1] || '';
	// establish nowjs connection
	// connection established ok
	now.ready(function() {
		// pass sid, server should set now.context and now.user
		//console.log('LOAD', now);
		now.getContext(sid, function(schema) {
			schema = schema.schema;
			//console.log('CTX', data.schema);
			// now.context holds the user capabilities
			// now.user holds the user profile
			//
			// setup the model
			//
			var model = new Backbone.Model({
			});
			console.log('NOWREADY', model);
			model.bind('change:entity', function() {
				console.log('CHENT', this, arguments);
			});
			model.bind('change:error', function() {
				console.log('CHERR', this, arguments);
			});
			model.bind('change:result', function() {
				console.log('CHRES', this, arguments);
			});
			//
			// setup RPC helper
			//
			var CALL = window.CALL = function(entity, method /*, params */) {
				model.set({entity: entity});
				var params = Array.prototype.slice.call(arguments, 2);
				var promise = $.Deferred();
				params.push(function(err, result) {
					//console.log('RET', err, result);
					model.set({error: err || null, result: err ? null : (result || null)});
					promise.resolve();
				});
				try {
					model.get('context')[entity][method].apply(null, params);
				} catch (err) {
					//console.log('ERR', err);
					if (err instanceof TypeError) {
						err = 'Forbidden';
					} else {
						err = err.message || err;
					}
					model.set({error: err, result: null});
					promise.resolve();
				}
				return promise;
			};
			//
			// setup UI
			//
			var ViewError = Backbone.View.extend({
				initialize: function() {
					model.bind('change:error', this.render);
				},
				render: function() {
					// normalize errors
					var error = model.get('error');
					if (error) {
						if (typeof error === 'string') error = {message: error};
						if (!Array.isArray(error)) error = [error];
						// TODO: beautify
					}
					$('#error').html(_.partial('error', {error: error}));
					return this;
				}
			});
			var ViewMenu = Backbone.View.extend({
				el: $('#menu'),
				template: $('#tmpl-menu').template(),
				initialize: function() {
					_.bindAll(this, 'render');
					model.bind('change:context', this.render);
				},
				render: function() {
					var data = model.get('context');
					var entities = [];
					_.each(data, function(methods, entity) {
						if (methods.query) entities.push(entity);
					});
					console.log('MENU', entities);
					$.tmpl(this.template, {entities: entities}).appendTo(this.el);
					return this;
				}
			});
			var ViewUser = Backbone.View.extend({
				el: $('#profile'),
				initialize: function() {
					_.bindAll(this, 'render');
					model.bind('change:user', this.render);
				},
				render: function() {
					var user = model.get('user');
					$(this.el).html(_.partial('profile', {user: user}));
					return this;
				}
			});
			var ViewList = Backbone.View.extend({
				el: $('#entity'),
				initialize: function() {
					_.bindAll(this, 'render');
					model.bind('change:result', this.render);
				},
				render: function() {
					var data = model.get('result') || [];
					var props = schema[model.get('entity')] || {type: 'object', properties: {id: {}}};
					var html = '';
					var propsArr = _.keys(props.properties);
					for (var i = 0, l = data.length; i < l; ++i) {
						var item = data[i];
						for (var j = 0; j < propsArr.length; ++j) {
							var prop = propsArr[j];
							html += _.template('<%=prop%>: <%=value%>&nbsp;', {prop: prop, value: item[prop] || ''});
						}
						html += '<br/>';
					}
					$(this.el).html(html);
					return this;
				}
			});
			var ViewItem = Backbone.View.extend({
				el: $('#item'),
				initialize: function() {
					_.bindAll(this, 'render');
					model.bind('change:result', this.render);
				},
				render: function() {
					var data = model.get('result');
					$(this.el).html(JSON.stringify(data));
					return this;
				}
			});
			//
			// controller
			//
			var Controller = Backbone.Controller.extend({
				initialize: function(config) {
					var self = this;
					var ctx = config.caps;
					//console.log('INIT', ctx);
					//
					// define entity routes
					//
					var entities = [];
					_.each(ctx, function(x, k) {
						if (!x) return;
						// list: #list/<Entity>[?querystring]
						if (x.query) {
							self.route(/^list\/(\w+)(?:\?(.*))?$/, 'list', function(entity, query) {
								if (!query) query = '';
								console.log('ROUTE: list', entity, query);
								CALL(entity, 'query', query).then(function() {
									//model.set({query: query});
								});
							});
						}
						// add: #add/<Entity>
						/*if (x.add) {
							self.route(/^add\/(\w+)$/, 'add', function(entity) {
								console.log('ROUTE: add', entity);
								CALL(entity, 'add', {}).then(function() {});
							});
						}*/
					});
					//console.log('ROUTES', list, this.routes);
				},
				routes: {
					'help':										'help',    // #help
					'search/:query':					'search',  // #search/kiwis
					'add/:entity':						'add',
					/***
					#admin/list/Foo?asdasd
					#admin/add/Foo
					#admin/edit/Foo
					***/
				},
				help: function() {
					console.log('HELP');
				},
				search: function(query) {
					console.log('SEARCH:', query);
				},
				admin: function() {
					console.log('ADMIN:');
				},
				add: function(entity) {
					console.log('ROUTE: add', entity);
					CALL(entity, 'add', {}).then(function() {});
				},
				view: function(entity) {
					console.log('ROUTE: add', entity);
					CALL(entity, 'add', {}).then(function() {});
				}
			});
			//
			// instantiate UI
			//
			new ViewError();
			new ViewMenu();
			new ViewUser();
			new ViewList();
			// update model, to cause initial render
			model.set({
				user: now.user,
				context: now.context,
				entity: null,
				error: null,
				result: null
			});
			// run application
			new Controller({caps: now.context});
			Backbone.history.start();
			// disconnect nullifies context
			now.core.on('disconnect', function() {
				console.log('DISCONNECTED');
				model.unset('context');
				// TODO: display reconnect link
			});
		});
		//
		// define `now` client-side functions, they will be called by server
		//
		now.receiveMessage = function(name, message) {
			$("#messages").append("<br>" + name + ": " + message);
		};
	});
});
