const mongoose = require('mongoose');
const { schemaOptions } = require('./modelOptions');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  email: {
    type: String,
    default: ''
  },
  number: {
    type: Number, // Changed type to Number
    required: true // Added required constraint
  },
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  role: {
    type: String,
    default: 'regular'
  },
  photo: {
    type: String,
    default: ''
  }
}, schemaOptions);

module.exports = mongoose.model('User', userSchema);
