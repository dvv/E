'use strict';

/*
 *
 * Copyright(c) 2011 Vladimir Dronnikov <dronnikov@gmail.com>
 * MIT Licensed
 *
*/

exports = {

	// GET /Foo
	index: function(req, res){
		res.send('forum index');
	},

	// GET /Foo/new
	new: function(req, res){
		res.send('new forum');
	},

	// POST /Foo
	create: function(req, res){
		res.send('create forum');
	},

	// GET /Foo/:id
	show: function(req, res){
		res.send('show forum ' + req.params.id);
	},

	// GET /Foo/:id/edit
	edit: function(req, res){
		res.send('edit forum ' + req.params.id);
	},

	// PUT /Foo/:id
	update: function(req, res){
		res.send('update forum ' + req.params.id);
	},

	// DELETE /Foo/:id
	destroy: function(req, res){
		res.send('destroy forum ' + req.params.id);
	},

};
