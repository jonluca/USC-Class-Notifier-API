const db = require('../core/mongo');
const mongoose = require('mongoose');
const semester = require("../config/config").semester;

//Main schema. One entry per section per user
const paidId = new mongoose.Schema({
  semester: {
    type: String,
    default: semester
  },
  paidId: String,
  email: String,
  date: {
    type: Date,
    default: new Date().toISOString()
  }
});

module.exports = db.model('paidIds', paidId);
