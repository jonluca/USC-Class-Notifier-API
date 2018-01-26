const student = require('../models/student');
const logger = require('log4js').getLogger("notification");
const paidEmails = require('../core/emailsWithTextNotifications');

let StudentController = {};

StudentController.createUser = (email, key, phone, uscid, ip, callback) => {

    let s = new student();
    s.email = email;
    s.verificationKey = key;
    s.phone = phone;
    s.uscid = id;
    s.ip = ip;
    s.paidForTextNotifications = paidEmails(email);

    s.save((err, user) => {
        if (err) {
            logger.error(`Error saving user ${email}: ${err}`);
            return callback(false);
        }
        logger.info(`Succesfully created user ${email}`);
        return callback(user);
    });

    // Generate user, save
};

StudentController.verifyByKey = (key, callback) => {
    student.findOneAndUpdate({verificationKey: key}, {validAccount: true}, function (err, doc) {
        if (err || !doc) {
            return callback(false);
        }
        logger.info("Verified " + email);
        return callback(true);
    });
};

StudentController.isVerified = (email, callback) => {
    student.findOne({email: email}, (err, user) => {
        if (err || !user) {
            logger.debug(`Error checking if ${email} is valid`);
            return callback(false);
        }
        return callback(user.validAccount);
    });
};

StudentController.userExists = (email, callback) => {
    student.findOne({email: email}, (err, user) => {
        if (err) {
            logger.error(`Error checking if user ${email} exists`);
            return callback(false);
        }
        return callback(user);
    });
};

StudentController.addClassToUser = (email, section) => {
    student.findOne({email: email}, (err, user) => {
        if (err) {
            logger.error(`Error checking if user ${email} exists`);
            return callback(false);
        }
        if (!user) {
            logger.error(`User ${email} not found when attempting to add class!`);
            return callback(false);
        }
        return callback(user);
    });

};

module.exports = StudentController;