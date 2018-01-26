const express = require('express');
const router = express.Router();
const logger = require('log4js').getLogger("notification");
const StudentController = require("../controllers/StudentController");
const phoneParser = require('phone-parser');
const validator = require('validator');
const rand = require("random-key");

function parsePhone(number) {
    if (!number) {
        return "";
    }
    let phone = number.trim();
    let parsedPhone = "";
    try {
        parsedPhone = phoneParser(phone, 'xxxxxxxxxx');
    } catch (e) {
        logger.error(`Error parsing phone number`);
    }
    return parsedPhone;
}

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('landing');
});

/* Verify user account. */
router.get('/verify', function (req, res, next) {
    const email = req.query.email;
    const key = req.query.key;

    if (!email || !key) {
        return res.status(300).render("landing").end();
    }

    StudentController.verifyByKey(key, (verified) => {
        if (verified) {
            return res.status(200).render("verify.ejs", {
                email,
                status: "Verified"
            });
        }
        return res.status(400).render("verify.ejs", {
            email,
            status: "Error verifying!"
        });
    });
});

/* Add a class to a user account. */
router.post('/notify', function (req, res, next) {
    const email = req.query.email;
    const sectionNumber = req.body.courseid;
    const department = req.body.department;
    let phone = parsePhone(req.body.phone);
    let uscid = req.body.id;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;

    if (!validator.isEmail(email)) {
        logger.info(`Invalid email ${email} sent`);
        return res.status(400).send({"error": "Invalid email!"}).end();
    }

    if (!sectionNumber || !department) {
        return res.status(400).send({"error": "Invalid department or section!"}).end();
    }

    const section = {
        sectionNumber: sectionNumber,
        department: department
    };

    UserController.userExists(email, (userExists) => {
        if (!userExists) {
            UserController.createUser(email, rand.generate(32), phone, uscid, ip, (success) => {
                if (!success) {
                    return res.status(500).send({"error": "Unable to create user account! Please email jdecaro@usc.edu with your information."}).end();
                }

            });
        }
        else {
            UserController.addClassToUser(email, section, (result) => {

            });
        }
    });
});

module.exports = router;
