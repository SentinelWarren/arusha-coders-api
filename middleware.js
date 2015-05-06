var passport = require('passport')
  , BasicStrategy = require('passport-http').BasicStrategy
  , AnonymousStrategy = require('passport-anonymous').Strategy
  , JWTStrategy = require('passport-jwt').Strategy
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

var jwt_options = {
  secretOrKey: config.jwt.secret,
  issuer: config.jwt.issuer,
  tokenBodyField: config.jwt.field,
  authScheme: config.jwt.scheme
}

passport.use(new JWTStrategy(jwt_options, function(payload, callback) {
  User.findOne({email: payload.sub}, callback);
}));

passport.use(new AnonymousStrategy());

var options = {session: false};

var exports = module.exports = {
  isAuthenticated: passport.authenticate(['basic', 'jwt'], options),
  maybeAuthenticated: passport.authenticate(['basic', 'jwt', 'anonymous'], options),

  create: function(req, res, next) {
    req.body.owner = req.user._id
    next();
  },

  configCORS: function(req, res, next) {
    if (!req.get('Origin')) {return next()}
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
    if ('OPTIONS' === req.method) {return res.send(200)}
    next();
  }
};
