const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { schemaOptions } = require('./modelOptions');

const taskSchema = new Schema({
  section: {
    type: Schema.Types.ObjectId,
    ref: 'Section',
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  etiquettes: {
    type: [String],
    default: []
  },
  members: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  deadline: {
    type: Date,
    default: null
  },
  description: {
    type: String,
    default: ''
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ],
  mediaFile: {
    type: String,
    default: ''
  },
  position: {
    type: Number,
    default: 0
  },
  creationDate: {
    type: Date,
    default: Date.now
  },
  lastUpdate: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number,
    default: 0
  }
}, schemaOptions);

module.exports = mongoose.model('Task', taskSchema);
