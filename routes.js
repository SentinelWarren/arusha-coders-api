require('coffee-script/register')

var middleware = require('./middleware')
  , api = require('./controllers/api')
  , account = require('./controllers/account')
  , token = require('./controllers/token')
  , password = require('./controllers/password')
  , config = require('./config')

/* python

// init requirements
import requests

// create a user
base = 'http://localhost:3333'
name, email, password = 'reuben cummings', email', 'password'
data = {'name': name, 'email': email, 'password': password, 'confirmPassword': password}
auth = (email, password)
r = requests.post(base + '/user', data=data)
r.json()

jwt = r.json()['objects']['jwt']
headers = {'Authorization': 'Bearer %s' % jwt}

// get user info
r = requests.get(base + '/user', auth=auth)
r.json()
r = requests.get(base + '/user', headers=headers)
r.json()

// create another token
r = requests.post(base + '/token', auth=auth)
r.json()
 */

var exports = module.exports = function(router) {
  router.route('/').get(function(req, res) {
    return res.send("Welcome to the " + config.brand + " API!");
  });

  router.route('/user')
    .get(middleware.isAuthenticated, account.userInfo)
    .post(account.signup)

  router.route('/token')
    .get(middleware.isAuthenticated, token.userInfo)
    .post(middleware.isAuthenticated, token.createToken)

  router.route('/password')
    .get(password.reset)

  return router
};
