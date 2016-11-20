require('coffee-script/register')

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , config = require('../config')

var TaskSchema = new Schema({
  owner: {type: Schema.ObjectId, ref: 'User', required: true},
  dateFormat: {type: String, required: true},
  description: {type: String, required: true},
  date: {type: String, required: true},
  hrs: {type: Number, required: true},
  notes: String,
});

module.exports = mongoose.model('Task', TaskSchema);
