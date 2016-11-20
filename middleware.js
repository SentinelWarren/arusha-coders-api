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

  create: function(req, res, next) {
    req.body.owner = req.user._id
    next();
  },

  configCORS: function(req, res, next) {
    if (!req.get('Origin')) {return next()}
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', headers);
    if ('OPTIONS' === req.method) {return res.send(200)}
    next();
  }
};
