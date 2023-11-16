const express = require("express");
const router = express.Router();
const logger = require("log4js").getLogger("notification");
const StudentController = require("../controllers/StudentController");
const EmailController = require("../controllers/EmailController");
const PaidIdController = require("../controllers/PaidIdController");
const phoneParser = require("phone-parser");
const validator = require("validator");
const rand = require("random-key");
const manualRefresh = require("../core/departmentRefresh");
const { getSemester } = require("../utils/semester");

function parsePhone(number) {
  if (!number) {
    return "";
  }
  let phone = number.trim();
  if (phone.startsWith("+1")) {
    phone = phone.slice(2);
  }
  // Try to fix common error of doing 1xxxxxxxxxxx
  if (phone.length === 11 && phone.startsWith("1")) {
    phone = phone.slice(1);
  }
  try {
    return phoneParser(phone, "xxxxxxxxxx");
  } catch (e) {
    logger.error(`Error parsing phone number ${number}`);
    return "";
  }
}

function validSection(section, department) {
  if (!section || !department) {
    return false;
  }
  return true;
}

/* GET home page. */
router.get("/refresh", (req, res, next) => {
  res.render("landing");
  logger.info("Manual Refresh Requested");
  manualRefresh();
});

router.get("/texts-enabled", (req, res, next) => {
  res.send({ enabled: true }).end();
});
/* GET home page. */
router.get("/", (req, res, next) => {
  res.render("landing");
});
router.get("/privacy", (req, res, next) => {
  res.render("privacy");
});
router.get("/terms", (req, res, next) => {
  res.render("terms");
});
/* Verify user account. */
router.get("/verify", (req, res, next) => {
  const email = req.query.email;
  const key = req.query.key;
  const section = req.query.section;
  if (!email) {
    return res.status(300).render("landing").end();
  }
  const semester = getSemester();

  StudentController.verifyByEmail(email, key, async (user) => {
    if (user) {
      const paidIds = {};
      for (const section of user.sectionsWatching) {
        paidIds[section.rand] = !!(await PaidIdController.isIdPaid(
          section.rand
        ));
      }
      if (section) {
        StudentController.addClassToUser(
          email,
          { sectionNumber: section },
          (result) => {
            if (!result) {
              logger.error(`Unable to reverify class to account for ${email}`);
              return res.status(400).render("verify.ejs", {
                email,
                paidIds,
                user,
                status:
                  "Error adding class to watchlist! Contact JonLuca about this error.",
                semester,
              });
            }
            return res.status(200).render("verify.ejs", {
              email,
              paidIds,
              user,
              status: `Watching section ${section}!`,
              semester,
            });
          }
        );
      } else {
        return res.status(200).render("verify.ejs", {
          email,
          paidIds,
          user,
          status: "Verified",
          semester,
        });
      }
    } else {
      return res.status(400).render("verify.ejs", {
        email,
        paidIds: [],
        user: null,
        status: "Error verifying!",
        semester,
      });
    }
  });
});
router.post("/update-phone", (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  const email = (req.body.email || "").toLowerCase().trim();
  const phone = parsePhone(req.body.phone || "");
  const key = (req.body.key || "").trim();
  if (!email || !phone || !key) {
    return res.status(500).end();
  }
  StudentController.updatePhoneNumber(email, key, phone, (success) => {
    if (success) {
      return res.status(200).end();
    }
    return res.status(500).end();
  });
});
/* Add a class to a user account. */
router.post("/notify", (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  const {
    department: department1,
    phone: phone1,
    email: email1,
    id,
    courseid,
    semester,
    fullCourseId,
  } = req.body;
  const email = (email1 || "").toLowerCase().trim();
  const sectionNumber = (courseid || "").trim();
  const department = (department1 || "").toUpperCase().trim();
  const ip =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.ip;
  const uscid = id;
  const phone = parsePhone(phone1 || "");
  if (!email || !sectionNumber || !department) {
    return res
      .status(400)
      .send({
        error: "Invalid email, section, or department!!",
        email,
        sectionNumber,
        department,
      })
      .end();
  }
  if (!validator.isEmail(email)) {
    logger.info(`Invalid email ${email} sent`);
    return res
      .status(400)
      .send({
        error: "Invalid email!",
        email,
        sectionNumber,
        department,
      })
      .end();
  }
  if (!validSection(sectionNumber, department)) {
    return res
      .status(400)
      .send({
        error: "Invalid department or section!",
        sectionNumber,
        department,
      })
      .end();
  }
  const section = {
    sectionNumber,
    department,
    phone,
    rand: `${rand.generateDigits(8)}`,
  };
  if (semester) {
    section.semester = semester;
  }
  if (fullCourseId) {
    section.fullCourseId = fullCourseId;
  }
  StudentController.userExists(email).then((userExists) => {
    if (!userExists) {
      const key = rand.generate(32);
      StudentController.createUser(email, key, phone, uscid, ip, (success) => {
        if (!success) {
          logger.error(`Unable to create account for ${email}`);
          return res
            .status(500)
            .send({
              error:
                "Unable to create user account! Please email schedule.error@jldc.me with your information.",
            })
            .end();
        }
        EmailController.sendVerificationEmail(email, key);
        addClass(res, email, section, true);
      });
    } else {
      addClass(res, email, section, false);
    }
  });
});

function addClass(res, email, section, isNewUser) {
  StudentController.addClassToUser(email, section, (user) => {
    if (!user) {
      logger.error(`Unable to add class to account for ${email}`);
      return res
        .status(500)
        .send({
          error:
            "Unable to add class to email! Please email jdecaro@usc.edu with your information.",
          email,
          section,
          phone: section.phone,
        })
        .end();
    }
    const status = isNewUser ? 200 : 201;
    const sec =
      user.sectionsWatching.find(
        (s) => s.sectionNumber === section.sectionNumber
      ) || section;

    if (!isNewUser) {
      EmailController.sendNowWatchingEmail(email, user.verificationKey, sec);
    }

    return res
      .status(status)
      .send({
        section: sec,
        email,
        phone: section.phone,
      })
      .end();
  });
}

module.exports = router;
