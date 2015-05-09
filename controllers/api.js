var promise, options, message, process, querify, errback, callback
  , utils = require('../utils')

  errback = function (err, req, res) {
    message = "Sorry, there was an error processing your query.";
    options = {message: message, err: err, status: 500, source: req.url}
    return utils.sendResponse(res, null, options);
  };

  callback = function(options) {
    if (!options.item) {
      message = "Sorry, " + options.req.params.type + " " + options.id
      message =+ " not found.";
      options = {message: message, status: 404, source: options.req.url}
      return utils.sendResponse(options.res, null, options);
    } else {
      response = {
        total: options.req.multiple ? options.item.length : 1
        , items: options.item
      };
      var opts = {status: options.status}
      return utils.sendResponse(options.res, response, opts);
    }
  };

process = function (promise, req, res, status) {
  var id = req.params.id || 'list'
  function _errback (err) {errback(err, req, res)};

  function _callback (item) {
    callback({item: item, req: req, res: res, status: status, id: id})
  };

  promise.addCallback(_callback).addErrback(_errback);
};

querify = function(query, options) {
  return query
    .limit(options.limit)
    .skip(options.limit * (options.page - 1))
    .sort(options.sort)
};

var exports = module.exports = {
  list: function(req, res) {
    req.multiple = true
    options = utils.parseRequest(req)
    query = req.ownedQuery.find(options.query)
    promise = querify(query, options).lean().exec()
    process(promise, req, res);
  },


  create: function(req, res) {
    promise = req.Model.create(req.body);
    process(promise, req, res, 201);
  },

  update: function(req, res) {
    query = req.ownedQuery.findOneAndUpdate({_id: req.params.id}, req.body)
    promise = query.lean().exec()
    process(promise, req, res);
  },

  get: function(req, res) {
    promise = req.ownedQuery.findOne({_id: req.params.id}).lean().exec()
    process(promise, req, res);
  },

  getByName: function(req, res) {
    promise = req.ownedQuery.findOne({name: req.params.id}).lean().exec()
    process(promise, req, res);
  },

  remove: function(req, res) {
    query = req.ownedQuery.findOneAndRemove({_id: req.params.id})
    promise = query.lean().exec()
    process(promise, req, res);
  },

  removeByName: function(req, res) {
    query = req.ownedQuery.findOneAndRemove({name: req.params.id})
    promise = query.lean().exec()
    process(promise, req, res);
  },
};