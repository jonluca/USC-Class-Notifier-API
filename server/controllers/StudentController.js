const student = require('../models/student');
const logger = require('log4js').getLogger("notification");

let StudentController = {};

StudentController.createUser = (email) => {
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
        callback(user);
    });
};