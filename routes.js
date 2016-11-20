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
    .get(isAuthenticated, filterByOwner, api.get)
    .patch(isAuthenticated, requireManager, api.update)
    .delete(isAuthenticated, requireManager, api.remove)

  router.route('/token')
    .get(isAuthenticated, token.userInfo)
    .post(isAuthenticated, token.createToken)

  router.route('/password')
    .get(password.reset)

  router.route('/task')
    .get(isAuthenticated, filterByOwner, api.list)
    .post(isAuthenticated, api.create)

  router.route('/task/:id')
    .get(isAuthenticated, filterByOwner, api.get)
    .patch(isAuthenticated, filterByOwner, api.update)
    .delete(isAuthenticated, filterByOwner, api.remove)

  router.route('/task/email/:id')
    .get(isAuthenticated, requireAdmin, api.getByEmail)
    .post(isAuthenticated, requireAdmin, api.createByEmail)
    .patch(isAuthenticated, requireAdmin, api.updateByEmail)
    .delete(isAuthenticated, requireAdmin, api.removeByEmail)

  return router
};
