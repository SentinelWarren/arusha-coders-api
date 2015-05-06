require('coffee-script/register')

var middleware = require('./middleware')
  , api = require('./controllers/api')
  , account = require('./controllers/account')
  , password = require('./controllers/password')
  , config = require('./config')

var isAuthenticated = middleware.isAuthenticated
  , maybeAuthenticated = middleware.maybeAuthenticated

/*
 * The following code is python
 *
 * // init requirements
 * import requests
 *
 * // create a user
 * base = 'http://localhost:3333'
 * name, email, password = 'reuben cummings', email', 'password'
 * data = {'name': name, 'email': email, 'password': password, 'confirmPassword': password}
 * r = requests.post(base + '/user', data=data)
 * auth = (email, password)
 *
 * //
 * r = requests.post(base + '/monitor', auth=auth)
 */

var exports = module.exports = function(router) {
  router.route('/').get(function(req, res) {
    return res.send("Welcome to the " + config.brand + " API!");
  });

  router.route('/user')
    .get(maybeAuthenticated, account.userInfo)
    .post(account.signup)

  router.route('/password')
    .get(password.reset)

  return router
};
