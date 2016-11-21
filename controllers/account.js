require('coffee-script/register')

var exports, sendUserInfo
  , utils = require('../utils')
  , async = require('async')
  , _ = require('underscore')
  , moment = require('moment')
  , User = require('../models/user')
  , config = require('../config')

exports = module.exports = {
  userInfo: function(req, res) {
    user = req.user || 'anon'
    utils.sendResponse(res, {user: user});
  },

  users: function(req, res) {
    var failOpts = {source: 'users'}
    console.log("Obtaining users list");

    User.find({}).exec(function(err, users) {
      if (err) {
        failOpts.status = 500
        var message = err.message
      } else {
        var message = "Successfully obtained users!"
      };

      console.log(message);

      var sanitize = function(user) {
        return _.pick(user, ['firstName', 'lastName', 'email', 'role', '_id']);
      };

      var sanitized = users.map(function(user) {
        return sanitize(user);
      });

      var options = _.extend({message: message, err: err}, failOpts)
      return utils.sendResponse(res, sanitized, options);
    });
  },

  signup: function(req, res) {
    var checkEmail, createUser, validateForm
      , newUser = null
      , verificationErr = null
      , form = req.body
      , failOpts = {source: 'signup'}

    validateForm = function(next, form) {
      var err = null
        , fields = [
            form.role,
            form.firstName,
            form.lastName,
            form.email,
            form.password,
            form.confirmPassword,
          ]

      if (!_.every(fields)) {
        err = {message: "You must fill out the entire form."};
        failOpts.status = 400
      } else if (form.password !== form.confirmPassword) {
        err = {message: "Please make sure both passwords match."};
        failOpts.status = 400
      };

      next(err);
    };

    checkEmail = function(next, form) {
      var id = form.email
        , query = User.findOne({email: id});

      console.log("Checking if " + id + " already exists");

      query.exec(function(err, user) {
        if (user) {
          failOpts.status = 409
          message = "The account " + id + " is already registered."
          console.log(message);
          err = {message: message}
        };

        next(err);
      });
    };

    createUser = function(next, form) {
      console.log('Creating new user...');
      newUser = new User(form);
      newUser.isVerified = false

      newUser.save(function(err) {
        var result = null

        if (!err) {
          var duration = moment.duration(config.jwt.duration)
            , expiration = moment().add(duration)
            , token = newUser.issueToken(expiration.unix())

          result = {
            role: newUser.role,
            email: newUser.email,
            _id: newUser._id,
            jwt: token,
            exp: expiration.calendar()}
        };

        next(err, result);
      });
    };

    async.series({
      'form': function(next) {validateForm(next, form)},
      'check': function(next) {checkEmail(next, form)},
      'create': function(next) {createUser(next, form)},
    },

    function(err, results) {
      var message

      if (results.create) {
        message = "Successfully created user " + newUser.email + "with role "
        message += + newUser.role + "!"
      } else {
        message = "Could not create new user.";
        failOpts.status = failOpts.status || 500
      };

      options = _.extend({message: message, err: err}, failOpts)
      return utils.sendResponse(res, results.create, options);
   });
  }
};
