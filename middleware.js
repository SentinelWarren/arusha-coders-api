var passport = require('passport')
  , BasicStrategy = require('passport-http').BasicStrategy
  , AnonymousStrategy = require('passport-anonymous').Strategy
  , JWTStrategy = require('passport-http-jwt-bearer').Strategy
  , User = require('./models/user')
  , utils = require('./utils')
  , config = require('./config')

passport.use(new BasicStrategy(
  function(email, password, callback) {
    User.findOne({email: email}, function (err, user) {
      if (err) {return callback(err)}
      if (!user) {return callback(null, false)}

      user.verifyPassword(password, function(err, match) {
        if (err) {return callback(err)}
        if (!match) {return callback(null, false)}
        return callback(null, user);
      });
    });
  }
));

passport.use(new JWTStrategy(config.jwt.secret, function(payload, callback) {
  User.findOne({email: payload.sub}, callback);
}));

passport.use(new AnonymousStrategy());

var options = {session: false};
var headers = 'Access-Control-Allow-Origin, Access-Control-Allow-Headers,';
headers += 'Origin, Accept, X-Requested-With, Content-Type, Authorization,';
headers += 'Access-Control-Request-Method, Access-Control-Request-Headers';

var exports = module.exports = {
  basicAuthenticated: passport.authenticate('basic', options),
  jwtAuthenticated: passport.authenticate('jwt-bearer', options),
  isAuthenticated: passport.authenticate(['basic', 'jwt-bearer'], options),
  maybeAuthenticated: passport.authenticate(
    ['basic', 'jwt-bearer', 'anonymous'], options
  ),

  hydrate: function(req, res, next) {
    var model = req.url.split('/')[1]
    req.Model = require('./models/' + model)
    next();
  },

  filterByOwner: function(req, res, next) {
    req.ownedQuery = req.Model.find({owner: req.user._id})
    next();
  },

  filterByRole: function(req, res, next) {
    var role = req.user.role || config.defaultRole

    if (role === 'admin') {
      req.ownedQuery = req.Model
    } else if (role === 'manager') {
      req.ownedQuery = req.Model.where('role').nin(['admin', 'manager'])
    } else {
      req.ownedQuery = req.Model.find({owner: req.user._id})
    };

    next();
  },

  requireAdmin: function(req, res, next) {
    var role = req.user.role || config.defaultRole

    if (role !== 'admin') {
      var message = 'Your current role is: ' + role + '.';
      message += 'You must be an admin in order to perform this action.';

      return utils.sendResponse(res, null, {
        source: 'isAdmin',
        status: 401,
        message: message,
        err: {message: message}
      });
    } else {
      next();
    }
  },

  requireManager: function(req, res, next) {
    var role = req.user.role || config.defaultRole
      , isManager = (ref = role) === 'admin' || ref === 'manager';

    if (!isManager) {
      var message = 'Your current role is: ' + role + '.';
      message += 'You must be either an admin or manager in order to ';
      message += 'perform this action.';

      return utils.sendResponse(res, null, {
        source: 'isManager',
        status: 401,
        message: message,
        err: {message: message}
      });
    } else {
      next();
    }
  },

  configCORS: function(req, res, next) {
    if (!req.get('Origin')) {return next()}
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', headers);
    if ('OPTIONS' === req.method) {return res.sendStatus(200)}
    next();
  }
};
