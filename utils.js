var exports, logger
  , winston = require('winston')
  , papertrail = require('winston-papertrail').Papertrail
  , mongoose = require('mongoose')
  , moment = require('moment')
  , _ = require('underscore')
  , util = require('util')
  , semver = require('semver')
  , transports = []
  , env = process.env.NODE_ENV || 'development'

function winstonConsole () {
  transports.push(new winston.transports.Console({colorize: true}));
}

function winstonFile (options) {
  transports.push(new winston.transports.File(options));
}

function winstonPapertrail () {
  var options = {
    handleExceptions: true,
    host: 'logs.papertrailapp.com',
    port: 55976,
    colorize: true
  }

  transports.push(new papertrail(options));
}

if (env == 'development') {
  winstonConsole();
  winstonFile({filename: 'server.log', maxsize: 2097152});
} else if (env == 'test') {
  winstonConsole();
} else if (env == 'production') {
  winstonPapertrail();
}

logger = new winston.Logger({transports: transports});

function connectWithRetry (mongoose, connectionString) {
  var options = {server: {auto_reconnect: true}}
  conn = mongoose.connect(connectionString, options)
  conn.on('err', function(err) {
    msg = 'Failed to connect to mongo on startup - retrying in 5 sec'
    console.error(msg, err);
    setTimeout(connectWithRetry.bind(mongoose, connectionString), 5000);
  });

  conn.on('open', function() {
    conn.db.admin().serverStatus(function(err, data) {
      if (!semver.satisfies(data.version, '>=2.1.0')) {
        msg = 'Error: Uptime requires MongoDB v2.1 minimum.'
        msg += 'The current MongoDB server is ' + data.version
        errback(msg);
      } else if (err && (err.errmsg === 'need to login' || err.errmsg === 'unauthorized')) {
        console.log('Forcing MongoDB authentication');
        conn.db.authenticate(mongo.user, mongo.pwd, errback);
      } else {
        errback(err);
      }
   });
 });
};

exports = module.exports = {
  logger: logger,
  env: env,
  connectWithRetry: connectWithRetry,


  parseRequest: function(req) {
    var options = _(req.query).extend(req.params)

    return {
      single: options.single,
      limit: options.limit || 50,
      page: options.page || 1,
      sort: options.sort || {isUp: 1, lastChanged: -1, timestamp: -1},
    }
  },

  durations: {
    'seconds': 1000,
    'minutes': 1000 * 60,
    'hours': 1000 * 60 * 60,
    'days': 1000 * 60 * 60 * 24,
    'months': 1000 * 60 * 60 * 24 * 30,
    'years': 1000 * 60 * 60 * 24 * 30 * 12
  },

  errback: function(err) {if (err) logger.error(err)},

  sendResponse: function(res, response, options) {
    var options = options || {}
      , status = options.status || 200
      , source = options.source
      , message = options.message
      , json = {source: source}

    if (options.err) {
      message = message ? message + " Please try again." : message;
      message += ' (' + source + ')';
      json.error = options.err;
    }

    if (response) {json.objects = response}
    res.status(status)
    res.json(json)
    // if (message) {debug(message)}
  }
};
