require('coffee-script/register')

var middleware = require('./middleware')
  , api = require('./controllers/api')
  , account = require('./controllers/account')
  , token = require('./controllers/token')
  , password = require('./controllers/password')
  , config = require('./config')

var exports = module.exports = function(router) {
  router.route('/').get(function(req, res) {
    return res.send("Welcome to the " + config.brand + "!");
  });

  router.route('/user')
    .get(middleware.isAuthenticated, account.userInfo)
    .post(account.signup)

  router.route('/users')
    .get(middleware.isAuthenticated, account.users)

  router.route('/token')
    .get(middleware.isAuthenticated, token.userInfo)
    .post(middleware.isAuthenticated, token.createToken)

  router.route('/password')
    .get(password.reset)

  return router
};
