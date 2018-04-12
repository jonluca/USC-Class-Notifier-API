const db = require('../core/mongo');
const mongoose = require('mongoose');

//Update every semester to only query the current reg
const semester = require("../config/config").semester;

const section = {
  sectionNumber: {
    type: String
  },
  department: {
    type: String
  },
  notified: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: new Date().toISOString()
  }
};

//Main schema. One entry per section per user
const student = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    required: true
  },
  sectionsWatching: [section],
  verificationKey: String,
  phone: String,
  validAccount: {
    type: Boolean,
    default: false
  },
  deleted: {
    type: Boolean,
    default: false
  },
  paidForTextNotifications: {
    type: Boolean,
    default: false
  },
  ip: String,
  uscID: String,
  semester: {
    type: String,
    default: semester
  },
  date: {
    type: Date,
    default: new Date().toISOString()
  }
});

student.methods.isAlreadyWatching = function isAlreadyWatching(section) {
  for (let sec of this.sectionsWatching) {
    if (sec.sectionNumber === section.sectionNumber) {
      return true;
    }
  }
  return false;
};

student.methods.markSectionAsNotNotified = function markSectionAsNotNotified(section) {
  for (let sec of this.sectionsWatching) {
    if (sec.sectionNumber === section.sectionNumber) {
      sec.notified = false;
      this.save();
    }
  }
};

module.exports = db.model('students', student);
