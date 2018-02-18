const student = require('../models/student');
const logger = require('log4js').getLogger("notification");
const emailHasPaidForText = require('../core/emailsWithTextNotifications');
const _ = require('lodash');

let StudentController = {};

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
        user.sectionsWatching.push(section);
        user.markModified('sectionsWatching');
        user.save();
        return callback(user);
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
        semester: "20181"
    });
    let departments = [];
    students.forEach(obj => {
        obj.sectionsWatching.forEach(section => {
            departments.push(section.department);
        });
    });

    return [...new Set(departments)];
};

StudentController.getStudentsByDepartment = (department, callback) => {
    //Search for users that are being notified for that department
    const query = {
        "sectionsWatching": {
            $elemMatch: {
                department: department
            }
        },
        validAccount: true,
        deleted: false,
        notified: false,
        semester: "20181"
    };
    student.find(query, (err, docs) => {
        if (err || docs === undefined) {
            callback(false);
        }
        callback(docs);
    });
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