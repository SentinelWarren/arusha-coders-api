require('coffee-script/register')

var host, options, timeoutHandler, server, winstonStream
  // , _ = require('underscore')
  , express = require('express')
  , router = express.Router()
  , morgan = require('morgan')
  , mongoose = require('mongoose')
  , passport = require('passport')
  , bodyParser = require('body-parser')
  , compression = require('compression')
  , timeout = require('connect-timeout')
  , middleware = require('./middleware')
  , routes = require('./routes')(router)
  , utils = require('./utils')
  , config = require('./config')

var mongo = config.mongo
  , connectionString = mongo.connectionString
  , prefix = mongo.user && mongo.pwd ? mongo.user + ':' + mongo.pwd + '@' : ''
  , defaultConnectionString = 'mongodb://' + prefix + mongo.server + '/' + mongo.db
  , conn = mongoose.connect(connectionString || defaultConnectionString)


var port = process.env.PORT || 3333
  , encoding = {encoding: 'utf-8'}
  , sv_timeout = 250 * 1000
  , sv_retry_after = 5 * 1000
  , app = express()

if (process.env.NODETIME_ACCOUNT_KEY) {
  require('nodetime').profile({
    accountKey: process.env.NODETIME_ACCOUNT_KEY,
    appName: config.site.title
  });
}

if (utils.env == 'development' && config.verbose) {
  mongoose.set('debug', true);
}

timeoutHandler = function(err, req, res, next) {
  options = {err: err, status: 504, source: 'app'}
  utils.sendResponse(res, null, options);
};

haltOnTimedout = function(req, res, next) {if (!req.timedout) {next()}};

winstonStream = {
  write: function(message, encoding) {return utils.logger.info(message)}
};


app.use(timeout(sv_timeout));
app.use(morgan('combined', {stream: winstonStream}));
app.use(haltOnTimedout);
app.use(bodyParser.urlencoded({extended: true}));
app.use(haltOnTimedout);
app.use(compression());
app.use(haltOnTimedout);
app.use(passport.initialize());

app.all('*', middleware.configCORS);

app.use(routes);
app.use(timeoutHandler);

server = app.listen(port, function() {
  utils.logger.info("Listening on port " + port);
});

// server.on('error', utils.errback});

