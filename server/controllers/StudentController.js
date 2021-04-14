const student = require('../models/student');
const logger = require('log4js').getLogger("notification");
const _ = require('lodash');
const config = require("../config/config");
const EmailController = require("./EmailController");
const TextController = require("./TextController");
const PaidIdController = require("./PaidIdController");
const semester = require("../config/config").semester;
let StudentController = {};
StudentController.createUser = (email, key, phone, uscid, ip, callback) => {
  // Create new user from their request
  let s = new student();
  s.email = email;
  s.verificationKey = key;
  s.phone = phone;
  s.uscID = uscid;
  s.ip = ip;
  s.save((err, user) => {
    if (err) {
      logger.error(`Error saving user ${email}: ${err}`);
      return callback(false);
    }
    logger.info(`Succesfully created user ${email}`);
    return callback(user);
  });
};
StudentController.updatePhoneNumber = (email, key, phone, callback) => {
  // Create new user from their request
  student.findOne({
    email,
    verificationKey: key
  }, (err, doc) => {
    if (!doc) {
      callback(false);
      return;
    }
    doc.updatePhoneNumber(phone, (success) => {
      callback(success);
    });
  });
};
StudentController.createRandomDataForTesting = (num) => {
  const departments = require('../core/ValidDepartments');
  for (let i = 0; i < num; i++) {
    let department = departments[Math.floor(Math.random() * departments.length)];
    // Create new user from their request
    let s = new student();
    s.email = department + "@usc.edu";
    s.verificationKey = i;
    s.phone = i;
    s.uscid = i;
    s.ip = i;
    s.validAccount = true;
    s.save(() => {
      StudentController.addClassToUser(s.email, {
        section: "1234",
        department
      }, () => {
      });
    });
  }
};
StudentController.verifyByKey = (key, callback) => {
  student.findOneAndUpdate({verificationKey: key}, {validAccount: true}, (err, doc) => {
    if (err || !doc) {
      return callback(false);
    }
    logger.info(`Verified ${doc.email}`);
    return callback(true);
  });
};
StudentController.verifyByEmail = (email, key, callback) => {
  student.findOneAndUpdate({
    email: email,
    verificationKey: key
  }, {validAccount: true}, (err, doc) => {
    if (err || !doc) {
      return callback(false);
    }
    logger.info(`Verified by email ${doc.email}`);
    return callback(doc);
  });
};
StudentController.isVerified = (email, callback) => {
  student.findOne({email}, (err, user) => {
    if (err || !user) {
      logger.debug(`Error checking if ${email} is valid`);
      return callback(false);
    }
    return callback(user.validAccount);
  });
};
StudentController.userExists = async (email) => {
  return await student.findOne({email});
};
StudentController.addClassToUser = (email, section, callback) => {
  student.findOne({email}, (err, user) => {
    if (err) {
      logger.error(`Error checking if user ${email} exists`);
      return callback(null);
    }
    if (!user) {
      logger.error(`User ${email} not found when attempting to add class!`);
      return callback(null);
    }
    // If they're already watching this section
    if (user.isAlreadyWatching(section)) {
      user.markSectionAsNotNotified(section, doc => {
        logger.info(`Marked section ${section.department} - ${section.sectionNumber} for ${user.email} as not notified`);
        section.rand = user.getRandForSection(section);
        return callback(user);
      });
      return;
    }
    logger.info(`User ${email} is now watching ${section.department} - ${section.sectionNumber}`);
    user.sectionsWatching.push(section);
    user.markModified('sectionsWatching');
    user.save();
    return callback(user);
  });
};
StudentController.notifyUser = async (user, course, count, paidId, section) => {
  EmailController.sendSpotsAvailableEmail(user.email, user.verificationKey, course, count);
  try {
    if (await PaidIdController.isIdPaid(paidId)) {
      logger.info(`Sent text message to ${user.email} for ${course.courseName} - ${course.sectionNumber}`);
      const personText = count == 1 ? 'person' : 'people';
      const verbText = count == 1 ? 'is' : 'are';
      const otherPeople = count > 0 ? `${count || '0'} other ${personText} ${verbText} watching this section.` : '';
      if (!section.phone) {
        logger.info(`Section phone invalid, falling back to user.phone: ${user.phone} for ${user.email} - paidId${paidId}`);
      }
      TextController.sendMessage(section.phone || user.phone, `Spots available for section ${course.sectionNumber} in class ${course.courseID}. ${otherPeople}`);
    }
  } catch (e) {
    logger.error(`Error checking if paid or sending text message for ${user.email} for ${course}- ${e} `);
  }
};
StudentController.removeUser = (email, key, callback) => {
  student.findOneAndUpdate({verificationKey: key}, {deleted: true}, (err, doc) => {
    if (err || !doc) {
      return callback(false);
    }
    logger.info(`Deleted ${email}`);
    return callback(true);
  });
};
StudentController.getAllWatchedDepartments = async () => {
  let students = await student.find({
    validAccount: true
  });
  let departments = new Set();
  students.forEach(obj => {
    obj.sectionsWatching.forEach(section => {
      if (!section.notified && section.department && section.semester === semester) {
        departments.add(section.department);
      }
    });
  });
  return departments;
};
StudentController.getStudentsByDepartment = async (department) => {
  //Search for users that are being notified for that department
  const query = {
    "sectionsWatching": {
      $elemMatch: {
        department,
        notified: false,
        semester
      }
    },
    validAccount: true
  };
  return await student.find(query);
};
StudentController.getNumberOfStudentsWatchingSection = async (sectionNumber, department) => {
  //Search for users that are being notified for that department
  const query = {
    "sectionsWatching": {
      $elemMatch: {
        department,
        sectionNumber,
        notified: false,
        semester
      }
    },
    validAccount: true
  };
  return await student.count(query);
};
StudentController.validateAccounts = () => {
  student.update({}, {validAccount: true}, {multi: true}, function (err, res) {
    if (err) {
      console.log(err);
    }
    console.log("Made all accounts valid");
    console.log("Modified " + res.nModified + " accounts.");
  });
};
module.exports = StudentController;
