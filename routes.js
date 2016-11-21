require('coffee-script/register')

var middleware = require('./middleware')
  , api = require('./controllers/api')
  , account = require('./controllers/account')
  , token = require('./controllers/token')
  , password = require('./controllers/password')
  , config = require('./config')
  , isAuthenticated = middleware.isAuthenticated
  , requireManager = middleware.requireManager
  , requireAdmin = middleware.requireAdmin
  , hydrate = middleware.hydrate
  , filterByOwner = middleware.filterByOwner
  , filterByRole = middleware.filterByRole

var exports = module.exports = function(router) {
  router.route('/').get(function(req, res) {
    return res.send("Welcome to the " + config.brand + "!");
  });

  router.route('/user')
    .get(isAuthenticated, account.userInfo)
    .post(account.signup)

  router.route('/users')
    .get(isAuthenticated, account.users)

  router.route('/user/:id')
    .get(isAuthenticated, hydrate, filterByRole, api.get)
    .patch(isAuthenticated, hydrate, filterByRole, api.update)
    .delete(isAuthenticated, hydrate, filterByRole, api.remove)

  router.route('/token')
    .get(isAuthenticated, token.userInfo)
    .post(isAuthenticated, token.createToken)

  router.route('/password')
    .get(password.reset)

  router.route('/task')
    .get(isAuthenticated, hydrate, filterByRole, api.list)
    .post(isAuthenticated, hydrate, api.create)

  router.route('/task/:id')
    .get(isAuthenticated, hydrate, filterByRole, api.get)
    .patch(isAuthenticated, hydrate, filterByRole, api.update)
    .delete(isAuthenticated, hydrate, filterByRole, api.remove)

  router.route('/task/email/:id')
    .post(isAuthenticated, hydrate, requireAdmin, api.createByEmail)
    .patch(isAuthenticated, hydrate, filterByRole, api.updateByEmail)

  return router
};
