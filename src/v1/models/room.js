const mongoose = require('mongoose');

const { schemaOptions } = require('./modelOptions')

const roomSchema = new mongoose.Schema({
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }]
},schemaOptions);

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;