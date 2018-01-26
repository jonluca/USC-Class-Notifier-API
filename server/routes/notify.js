const express = require('express');
const router = express.Router();
const logger = require('log4js').getLogger("notification");
const StudentController = require("../controllers/StudentController");
const phoneParser = require('phone-parser');
var validator = require('validator');

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

/* Verify user account. */
router.post('/notify', function (req, res, next) {
    const email = req.query.email;
    const sectionNumber = req.body.courseid;
    const department = req.body.department;
    let phone = parsePhone(req.body.phone);
    let id = req.body.id;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;

    if (!validator.isEmail(email)) {
        logger.info(`Invalid email ${email} sent`);
        return res.status(400).send({"error": "Invalid email!"}).end();
    }

    UserController.userExists(email, (userExists)=>{
        if(userExists){

        }
    })
});

module.exports = router;
