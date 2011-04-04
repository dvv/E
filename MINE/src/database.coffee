'use strict'

###
 *
 * Simple database
 *
 * Copyright(c) 2011 Vladimir Dronnikov <dronnikov@gmail.com>
 * MIT Licensed
 *
###

parseUrl = require('url').parse
mongo = require 'mongodb'
events = require 'events'


#
#
# MAJOR FIXME: context is so far used for
# 1. holding uid via context.user.id
# 2. in add: for holding user parents
# 3. in add/update: for setting validate `this` to allow validate to snoop into DB model
#
# HOW TO GET RID OF THAT?
#
#

#
# N.B. schema.saveChanges: true to populate _meta.history data with changes to the object
#

#
# N.B. schema.constrain: {key: 'propname', value: 'propvalue'} will constrain all methods' query to contain .eq(propname, propvalue)
#

class Database extends events.EventEmitter

	constructor: (options = {}, definitions, callback) ->
		# we connect by URL
		conn = parseUrl options.url or ''
		host = conn.hostname
		port = +conn.port if conn.port
		@auth = conn.auth if conn.auth # FIXME: should not sit in @
		name = conn.pathname.substring(1) if conn.pathname
		# cache of collections
		@collections = {}
		# model -- collection of registered entities
		@model = {}
		# primary key factory
		@idFactory = () -> (new mongo.BSONPure.ObjectID).toHexString()
		# attribute to be used to mark document as deleted
		# N.B. introduce a helper attribute which allows to deactivate records
        # effectively switching them off query/update/remove operations
        # 3 additional methods added: delete to deactivate;
        # undelete to reactivate
        # purge to physically remove deactivated records
		@attrInactive = options.attrInactive #'_deleted'
		# DB connection
		@db = new mongo.Db name or 'test', new mongo.Server(host or '127.0.0.1', port or 27017) #, native_parser: true
		# register schema
		@open definitions, callback if definitions

	###########
	# N.B. all the methods should return undefined, to prevent leak of private info
	###########

	#
	# connect to DB, optionally authenticate, cache collections named after `collections[]`
	#
	#
	# FIXME: we already have this in the driver?!
	#
	open: (collections, callback) ->
		self = @
		self.db.open (err, result) ->
			if self.auth
				[username, password] = self.auth.split ':', 2
				self.db.authenticate username, password, (err, result) ->
					return callback? err.message if err
					self.register collections, callback
					return
			else
				return callback? err.message if err
				self.register collections, callback
		return

	register: (schema, callback) ->
		self = @
		len = _.size schema
		for name, definition of schema
			do (name) ->
				colName = definition.collection or name
				self.db.collection colName, (err, coll) ->
					self.collections[colName] = coll
					# TODO: may init indexes here
					# ...
					# model
					store = self.getModel name, definition
					# extend the store
					if definition?.prototype
						for own k, v of definition.prototype
							store[k] = if _.isFunction v then v.bind store else v
						delete definition.prototype
					# define identification
					Object.defineProperties store,
						id:
							value: name
						schema:
							value: definition
					# register model
					self.model[name] = store
					# all done?
					if --len <= 0
						callback? err?.message, self.model
				return
		return

	#
	# return the list of documents matching `query`
	# N.B. attributes are filtered by optional `schema`
	#
	query: (collection, own, schema, context, query, callback) ->
		self = @
		#console.log 'FIND??', query, @attrInactive
		query = _.rql(query)
		# filter own documents
		if own
			uid = context and context.user and context.user.id
			if uid
				# check if the context user listed in document creators
				query = query.eq('_meta.history.0.who', uid)
		# impose constraints
		_.each schema?.constraints, (constraint) ->
			query = query[constraint.op](constraint.key, constraint.value)
		# skip inactive documents
		if @attrInactive
			query = query.ne(@attrInactive,true)
		#console.log 'FIND?', query
		query = query.toMongo()
		#console.log 'FIND!', query
		self.emit 'query',
			collection: collection
			user: uid
			search: query.search
			params: query.meta
		@collections[collection].find query.search, query.meta, (err, cursor) ->
			return callback? err.message if err
			cursor.toArray (err, docs) ->
				#console.log 'FOUND', arguments
				return callback? err.message if err
				for doc, i in docs
					# _id -> id
					doc.id = doc._id
					delete doc._id
					# filter out protected fields
					if schema
						_.validate doc, schema, veto: true, removeAdditionalProps: !schema.additionalProperties, flavor: 'query'
				docs = _.map docs, _.values if query.meta.values
				callback? null, docs
				return
			return
		return

	#
	# return the first documents matching `id`; attributes are filtered by optional `schema`
	# N.B. internally uses @query
	#
	get: (collection, own, schema, context, id, callback) ->
		query = _.rql('limit(1)').eq('id',id)
		# filter own document
		if own
			uid = context and context.user and context.user.id
			if uid
				# check if the context user listed in document creators
				query = query.eq('_meta.history.0.who', uid)
		# impose constraints. N.B. we have to do it here, not in query, since we call query with no schema!
		_.each schema?.constraints, (constraint) ->
			query = query[constraint.op](constraint.key, constraint.value)
		@query collection, own, null, context, query, (err, result) ->
			if callback
				if err
					callback err.message
				else
					doc = result[0] or null
					if schema and doc
						_.validate doc, schema, veto: true, removeAdditionalProps: !schema.additionalProperties, flavor: 'get'
					callback null, doc
			return
		return

	#
	# insert new `document` validated by optional `schema`
	#
	add: (collection, schema, context, document = {}, callback) ->
		self = @
		# assign new primary key unless specified
		document.id = @idFactory() unless document.id
		# get the context user
		uid = context and context.user and context.user.id
		#
		Next self,
			(err, result, next) ->
				#console.error 'BEFOREADD', document, schema
				# validate document
				if schema
					_.validate.call context, document, schema, {veto: true, removeAdditionalProps: not schema.additionalProperties, flavor: 'add', coerce: true}, next
				else
					next null, document
				return
			(err, document, next) ->
				#console.error 'ADDVALIDATED', arguments
				return next err if err
				# id -> _id
				document._id = document.id
				delete document.id
				# add history line
				#console.log 'CREATOR', user, context?.user?._meta?.history?[0].who
				parents = context?.user?._meta?.history?[0].who or []
				parents.unshift uid
				document._meta =
					history: [
						who: parents
						when: Date.now()
						# FIXME: should we put initial document here?
					]
				# do add
				@collections[collection].insert document, {safe: true}, next
				return
			(err, result, next) ->
				#console.error 'ADD', arguments
				if err
					if err.message?.substring(0,6) is 'E11000'
						err = [{property: 'id', message: 'duplicated'}]
					callback? err
					#self.emit 'add',
					#	collection: collection
					#	user: uid
					#	error: err
				else
					result = result[0]
					result.id = result._id
					delete result._id
					# filter out protected fields
					if schema
						_.validate result, schema, veto: true, removeAdditionalProps: not schema.additionalProperties, flavor: 'get'
					callback? null, result
					self.emit 'add',
						collection: collection
						user: uid
						result: result
				return
		return

	#
	# update documents matching `query` using `changes` partially validated by optional `schema`
	#
	update: (collection, own, schema, context, query, changes = {}, callback) ->
		self = @
		uid = context and context.user and context.user.id
		query = _.rql(query)
		# filter own documents
		if own and uid
			query = query.eq('_meta.history.0.who', uid)
		# impose constraints
		_.each schema?.constraints, (constraint) ->
			query = query[constraint.op](constraint.key, constraint.value)
		query = query.toMongo()
		# atomize the query
		query.search.$atomic = 1
		Next self,
			(err, result, next) ->
				#console.log 'BEFOREUPDATE', query, changes, schema
				# validate document
				if schema
					_.validate.call context, changes, schema, {veto: true, removeAdditionalProps: !schema.additionalProperties, existingOnly: true, flavor: 'update', coerce: true}, next
				else
					next null, changes
				return
			(err, changes, next) ->
				#console.log 'BEFOREUPDATEVALIDATED', arguments
				# N.B. we inhibit empty changes
				return next err if err or not _.size changes
				# add history line
				history =
					who: uid
					when: Date.now()
				delete changes._meta
				history.what = changes
				# ensure changes are in multi-update format
				# FIXME: should prohibit $set and id in changes at facet level!!!
				changes = $set: changes #unless changes.$set or changes.$unset
				# TODO: document this
				if schema?.saveChanges
					changes.$push = '_meta.history': history
				# do multi update
				@collections[collection].update query.search, changes, {multi: true}, next
				return
			(err, result) ->
				callback? err?.message or err
				self.emit 'update',
					collection: collection
					user: uid
					search: query.search
					changes: changes
					err: err?.message or err
				return
		return

	#
	# physically remove documents
	#
	remove: (collection, own, context, query, callback) ->
		self = @
		query = _.rql(query)
		uid = context and context.user and context.user.id
		# filter own documents
		if own and uid
			query = query.eq('_meta.history.0.who', uid)
		# impose constraints
		_.each schema?.constraints, (constraint) ->
			query = query[constraint.op](constraint.key, constraint.value)
		query = query.toMongo()
		# naive fuser
		return callback? 'Refuse to remove all documents w/o conditions' unless _.size query.search
		@collections[collection].remove query.search, (err) ->
			callback? err?.message
			self.emit 'remove',
				collection: collection
				user: uid
				search: query.search
				error: err?.message
			return
		return

	#
	# mark documents as deleted if @attrInactive specified, or remove them unless
	#
	delete: (collection, own, context, query, callback) ->
		if @attrInactive
			query = _.rql(query).ne(@attrInactive,true)
			# the only change is to set @attrInactive
			changes = {}
			changes[@attrInactive] = true
			# update documents
			@update collection, own, null, context, query, changes, callback
		else
			@remove collection, own, context, query, callback
		return

	#
	# clears documents' deleted mark
	#
	undelete: (collection, own, context, query, callback) ->
		if @attrInactive
			query = _.rql(query).eq(@attrInactive,true)
			# the only change is to set @attrInactive
			changes = {}
			changes[@attrInactive] = false
			# update documents
			@update collection, own, null, context, query, changes, callback
		else
			callback?()
		return

	#
	# physically remove documents marked as deleted
	#
	purge: (collection, own, context, query, callback) ->
		if @attrInactive
			query = _.rql(query).eq(@attrInactive,true)
			@remove collection, own, context, query, callback
		else
			callback?()
		return

	#
	# return model -- set of DB accessor methods for a particular collection,
	# bound to the db and the collection and optional schema
	#

	#
	#
	#
	#
	#
	#

	getModel: (entity, schema) ->
		collection = schema.collection or entity
		db = @
		# compose the store
		store =
			# schemaless methods -- should be for internal use only
			_add: db.add.bind(db, collection, false)
			_queryAny: db.query.bind(db, collection, false)
			_queryOwn: db.query.bind(db, collection, true)
			_getAny: db.get.bind(db, collection, false)
			_getOwn: db.get.bind(db, collection, true)
			_updateAny: db.update.bind(db, collection, false)
			_updateOwn: db.update.bind(db, collection, true)
			# safe accessors
			add: db.add.bind(db, collection, schema)
			queryAny: db.query.bind(db, collection, false, schema)
			queryOwn: db.query.bind(db, collection, true, schema)
			getAny: db.get.bind(db, collection, false, schema)
			getOwn: db.get.bind(db, collection, true, schema)
			updateAny: db.update.bind(db, collection, false, schema)
			updateOwn: db.update.bind(db, collection, true, schema)
			removeAny: db.remove.bind(db, collection, false)
			removeOwn: db.remove.bind(db, collection, true)
		# special methods to support delayed deletion
		if @attrInactive
			_.extend store,
				deleteAny: db.delete.bind(db, collection, false)
				deleteOwn: db.delete.bind(db, collection, true)
				undeleteAny: db.undelete.bind(db, collection, false)
				undeleteOwn: db.undelete.bind(db, collection, true)
				purgeAny: db.purge.bind(db, collection, false)
				purgeOwn: db.purge.bind(db, collection, true)
		#console.log entity, collection, store
		store

module.exports.Database = Database

`
//
// helpers to tune properties
//

_.extend(module.exports, {
	// read-only
	ro: function(attr) {return _.extend({}, attr, {veto: {update: true}});},
	// query-only
	qo: function(attr) {return _.extend({}, attr, {veto: {get: true, update: true}});},
	// write-only
	wo: function(attr) {return _.extend({}, attr, {veto: {query: true, get: true}});},
	// create-only
	co: function(attr) {return _.extend({}, attr, {veto: {query: true, get: true, update: true}});},
	// fix the value
	fix: function(attr, value) {return _.extend({}, attr, {value: value});},
	// define default value
	def: function(attr, value) {return _.extend({}, attr, {default: value});},
});

`
