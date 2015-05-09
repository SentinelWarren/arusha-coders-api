require('coffee-script/register')

var exports, sendUserInfo, createToken
  , utils = require('../utils')
  , moment = require('moment')
  , config = require('../config')

exports = module.exports = {
  userInfo: function(req, res) {
    user = req.user || 'anon'
    utils.sendResponse(res, {user: user});
  },

  createToken: function(req, res) {
    var duration = moment.duration(config.jwt.duration)
      , expiration = moment().add(duration)
      , options = {message: 'Your new api token has been created'}
      , token = req.user.issueToken(expiration.unix(), req.body.cid)

    var response = {
      result: {jwt: token, exp: expiration.calendar(), cid: req.body.cid}
    }
    utils.sendResponse(res, response, options);
  },
};
