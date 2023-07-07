const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { schemaOptions } = require('./modelOptions');

const boardSchema = new Schema({
  users: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  icon: {
    type: String,
    default: '📃'
  },
  title: {
    type: String,
    default: 'Untitled'
  },
  description: {
    type: String,
    default: ``
  },
  position: {
    type: Number
  },
  favourite: {
    type: Boolean,
    default: false
  },
  favouritePosition: {
    type: Number,
    default: 0
  },
  boardAdmin: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, schemaOptions);

module.exports = mongoose.model('Board', boardSchema);
