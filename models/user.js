require('coffee-script/register')

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , bcrypt = require('bcrypt')
  , jwt = require('jsonwebtoken')
  , config = require('../config')

var UserSchema = new Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  email: {type: String, unique: true, required: true},
  password: {type: String, required: true},
  resetPasswordKey: String,
  accountVerificationKey: String,
  isVerified: {type: Boolean, default: false},
});

UserSchema.virtual('name').get(function () {
  return this.firstName + ' ' + this.lastName;
});

UserSchema.virtual('name').set(function (name) {
  var split = name.split(' ');
  this.firstName = split[0];
  this.lastName = split[1];
});

UserSchema.pre('save', function(next) {
  var user = this;

  // Break out if the password hasn't changed
  if (!user.isModified('password')) return next();

  // Password changed so we need to hash it
  bcrypt.hash(user.password, 10, function(err, hash) {
    if (!err) {user.password = hash};
    next(err);
  });
});

UserSchema.methods.verifyPassword = function(password, callback) {
  bcrypt.compare(password, this.password, callback);
};

UserSchema.methods.issueToken = function(timestamp, cid) {

  console.log('issueToken');
  var payload = {
    sub: this.email,
    exp: timestamp,
    aud: cid,
    iss: config.jwt.issuer,
    iat: Date.now()
  }

  console.log('payload', payload);

  return jwt.sign(payload, config.jwt.secret);
};

module.exports = mongoose.model('User', UserSchema);
