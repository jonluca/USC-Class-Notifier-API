const student = require('../models/student');
const logger = require('log4js').getLogger("notification");
const emailHasPaidForText = require('../core/emailsWithTextNotifications');
const _ = require('lodash');
const config = require("../config/config");


let StudentController = {};
const EmailController = require("./EmailController");
StudentController.createUser = (email, key, phone, uscid, ip, callback) => {
  // Create new user from their request
  let s = new student();
  s.email = email;
  s.verificationKey = key;
  s.phone = phone;
  s.uscid = uscid;
  s.ip = ip;
  s.paidForTextNotifications = emailHasPaidForText(email);

  s.save((err, user) => {
    if (err) {
      logger.error(`Error saving user ${email}: ${err}`);
      return callback(false);
    }
    logger.info(`Succesfully created user ${email}`);
    return callback(user);
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
      return callback(false);
    }
    if (!user) {
      logger.error(`User ${email} not found when attempting to add class!`);
      return callback(false);
    }
    // If they're already watching this section
    if (user.isAlreadyWatching(section)) {
      return callback(user);
    }
    logger.info(`User ${email} is now watching ${section.department} - ${section.sectionNumber}`);
    user.sectionsWatching.push(section);
    user.markModified('sectionsWatching');
    user.save();
    return callback(user);
  });
};

StudentController.notifyUser = (email, section) => {
  student.findOne({email}, (err, user) => {
    EmailController.sendSpotsAvailableEmail(email, user.key, section);
    for (const sectionUser of user.sectionsWatching) {
      if (sectionUser.sectionNumber == section.sectionNumber) {
        sectionUser.notified = true;
      }
    }
    user.markModified('sectionsWatching');
    user.save();
  });
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
    validAccount: true,
    semester: config.semester
  });
  let departments = new Set();
  students.forEach(obj => {
    obj.sectionsWatching.forEach(section => {
      if (!section.notified) {
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
        department: department,
        notified: false
      }
    },
    validAccount: true,
    deleted: false,
    semester: config.semester
  };
  return await student.find(query);
};

StudentController.validateAccounts = () => {
  student.update({}, {validAccount: true}, {multi: true}, function (err, res) {
    if (err) {
      console.log(err);
    }
    console.log("Made all accounts valid");
  });
};
module.exports = StudentController;