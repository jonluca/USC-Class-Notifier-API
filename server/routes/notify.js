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
  if (phone.startsWith("+1")) {
    phone = phone.slice(2);
  }
  // Try to fix common error of doing 1xxxxxxxxxxx
  if (phone.length === 11 && phone.startsWith(1)) {
    phone = phone.slice(1);
  }
  try {
    parsedPhone = phoneParser(phone, 'xxxxxxxxxx');
  } catch (e) {
    logger.error(`Error parsing phone number ${number}`);
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

  return ValidDepartments.includes(department.toUpperCase());

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
  const section = req.query.section;

  if (!email || !key) {
    return res.status(300).render("landing").end();
  }

  // Accidentally broke key verification for some users in SP18, so just for this semester I'm disabling key
  // verification.  StudentController.verifyByKey(key, (verified) => { if (verified) { return
  // res.status(200).render("verify.ejs", { email, status: "Verified" }); } return res.status(400).render("verify.ejs",
  // { email, status: "Error verifying!" }); });

  StudentController.verifyByEmail(email, (verified) => {
    if (verified) {
      if (section) {
        StudentController.addClassToUser(email, {sectionNumber: section}, (result) => {
          if (!result) {
            logger.error(`Unable to reverify class to account for ${email}`);
            return res.status(400).render("verify.ejs", {
              email,
              status: "Error adding class to watchlist! Contact JonLuca about this error."
            });
          }
          return res.status(200).render("verify.ejs", {
            email,
            status: `Watching section ${section}!`
          });
        });
      } else {
        return res.status(200).render("verify.ejs", {
          email,
          status: "Verified"
        });
      }
    } else {
      return res.status(400).render("verify.ejs", {
        email,
        status: "Error verifying!"
      });
    }
  });
});

/* Add a class to a user account. */
router.post('/notify', (req, res, next) => {
  const email = req.body.email;
  const sectionNumber = req.body.courseid;
  const department = req.body.department;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
  const uscid = req.body.id;
  let phone = "";
  if (req.body.phone != undefined) {
    phone = parsePhone(req.body.phone);
  }

  if (!email || !sectionNumber || !department) {
    return res.status(400).send({
      "error": "Invalid email, section, or department!!"
    }).end();
  }

  if (!validator.isEmail(email)) {
    logger.info(`Invalid email ${email} sent`);
    return res.status(400).send({
      "error": "Invalid email!"
    }).end();
  }

  if (!validSection(sectionNumber, department)) {
    return res.status(400).send({
      "error": "Invalid department or section!"
    }).end();
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
          return res.status(500).send({
            "error": "Unable to create user account! Please email jdecaro@usc.edu with your information."
          }).end();
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
      return res.status(500).send({
        "error": "Unable to add class to email! Please email jdecaro@usc.edu with your information."
      }).end();
    }
    if (isNew) {
      res.status(200).end();
    } else {
      res.status(201).end();
    }
  });
}

module.exports = router;
