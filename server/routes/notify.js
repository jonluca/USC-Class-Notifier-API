const express = require("express");
const router = express.Router();
const logger = require('log4js').getLogger("notification");
const StudentController = require("../controllers/StudentController");
const EmailController = require('../controllers/EmailController');
const phoneParser = require('phone-parser');
const validator = require('validator');
const rand = require("random-key");
const ValidDepartments = require('../core/ValidDepartments');
const manualRefresh = require('../core/departmentRefresh');

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

function validSection(section, department) {
  if (!section || !department) {
    return false;
  }
  if (section === "" || department === "") {
    return false;
  }

  if (!ValidDepartments.includes(department.toUpperCase())) {
    return false;
  }

  return true;
}

/* GET home page. */
router.get('/refresh', (req, res, next) => {
  res.render('landing');
  logger.info("Manual Refresh Requested");
  manualRefresh();
});

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('landing');
});

/* Verify user account. */
router.get('/verify', (req, res, next) => {
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
router.post('/notify', (req, res, next) => {
  const email = req.body.email;
  const sectionNumber = req.body.courseid;
  const department = req.body.department;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
  const uscid = req.body.id;

  let phone = parsePhone(req.body.phone);

  if (!validator.isEmail(email)) {
    logger.info(`Invalid email ${email} sent`);
    return res.status(400).send({"error": "Invalid email!"}).end();
  }

  if (!validSection(sectionNumber, department)) {
    return res.status(400).send({"error": "Invalid department or section!"}).end();
  }

  const section = {
    sectionNumber: sectionNumber.trim(),
    department: department.toUpperCase().trim()
  };

  StudentController.userExists(email).then((userExists) => {
    if (!userExists) {
      const key = rand.generate(32);
      StudentController.createUser(email, key, phone, uscid, ip, (success) => {
        if (!success) {
          logger.error(`Unable to create account for ${email}`);
          return res.status(500).send({"error": "Unable to create user account! Please email jdecaro@usc.edu with your information."}).end();
        }
        EmailController.sendVerificationEmail(email, key);
        addClass(res, email, section, true);
      });
    } else {
      addClass(res, email, section, false);
    }
  });
});

function addClass(res, email, section, isNew) {
  StudentController.addClassToUser(email, section, (result) => {
    if (!result) {
      logger.error(`Unable to add class to account for ${email}`);
      return res.status(500).send({"error": "Unable to add class to email! Please email jdecaro@usc.edu with your information."}).end();
    }
    if (isNew) {
      res.status(200).end();
    } else {
      res.status(201).end();
    }
  });
}

module.exports = router;
