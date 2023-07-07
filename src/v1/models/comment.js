const mongoose = require('mongoose');
const Schema = mongoose.Schema
const { schemaOptions } = require('./modelOptions')


const commentSchema = new Schema({
  task: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
},schemaOptions);

module.exports = mongoose.model('Comment', commentSchema);
