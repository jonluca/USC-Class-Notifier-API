const db = require("../core/mongo");
const mongoose = require("mongoose");
const { getSemester } = require("../utils/semester");
const logger = require("log4js").getLogger("notification");
//Update every semester to only query the current reg
const section = {
  sectionNumber: {
    type: String,
  },
  department: {
    type: String,
  },
  notified: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    default: "",
  },
  rand: {
    type: String,
    default: "",
  },
  fullCourseId: {
    type: String,
  },
  semester: {
    type: String,
    default: () => {
      return getSemester();
    },
  },
  date: {
    type: Date,
    default: new Date().toISOString(),
  },
};
//Main schema. One entry per section per user
const student = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    required: true,
  },
  sectionsWatching: [section],
  verificationKey: String,
  phone: String,
  validAccount: {
    type: Boolean,
    default: false,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  ip: String,
  uscID: String,
  date: {
    type: Date,
    default: new Date().toISOString(),
  },
});
student.methods.isAlreadyWatching = function isAlreadyWatching(sectionToWatch) {
  for (const section of this.sectionsWatching) {
    if (section.sectionNumber === sectionToWatch.sectionNumber) {
      return true;
    }
  }
  return false;
};
student.methods.getRandForSection = function isAlreadyWatching(sectionToWatch) {
  for (const section of this.sectionsWatching) {
    if (section.sectionNumber === sectionToWatch.sectionNumber) {
      return section.rand;
    }
  }
  return false;
};
student.methods.markSectionAsNotNotified = function markSectionAsNotNotified(
  section,
  callback
) {
  for (let sec of this.sectionsWatching) {
    if (sec.sectionNumber === section.sectionNumber) {
      sec.notified = false;
      if (section.phone && sec.phone !== section.phone) {
        sec.phone = section.phone;
      }
    }
  }
  this.save((err, user) => {
    if (err) {
      logger.error(
        `Error marking section as not notified user ${this.email}: ${err}`
      );
    }
    logger.info(
      `Succesfully marked section as not notified for user ${this.email} - section ${section.sectionNumber}`
    );
    if (callback) {
      callback(this);
    }
  });
};

student.methods.updatePhoneNumber = function updatePhoneNumber(
  phone,
  callback
) {
  for (let sec of this.sectionsWatching) {
    sec.phone = phone;
  }
  this.markModified("sectionsWatching");

  this.save((err, user) => {
    if (err) {
      logger.error(`Error updating phone number ${this.email}: ${err}`);
      callback(null);
      return;
    }
    logger.info(
      `Succesfully updated phone number for user ${this.email} - phone ${phone}`
    );
    if (callback) {
      callback(this);
    }
  });
};
module.exports = db.model("students", student);
