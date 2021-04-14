const express = require("express");
const router = express.Router();
const students = require("../models/student");
const paidId = require("../models/paidIds");
const PaidIdController = require("../controllers/PaidIdController");
const logger = require("log4js").getLogger("notification");
/* GET users listing. */
router.get("/", function (req, res, next) {
  res.render("admin", {
    title: "SOC API",
  });
});
/* GET users listing. */
router.get("/users", function (req, res, next) {
  students.find({}, (err, people) => {
    return res.json(people).end();
  });
});
/* GET ids listing. */
router.get("/ids", function (req, res, next) {
  paidId.find({}, (err, ids) => {
    return res.json(ids).end();
  });
});
/* POST new id. */
router.post("/addId", async function (req, res, next) {
  const id = (req.body.id || "").toLowerCase().trim();
  if (!id) {
    return res.status(402).end();
  }
  let hadErrors = false;
  const split = id.split();
  for (const subId of split) {
    if (!subId) {
      continue;
    }
    try {
      const commaSplit = subId.split(",");
      for (const subSubId of commaSplit) {
        if (!subSubId) {
          continue;
        }
        const actualId = (subSubId || "").trim();
        const isnum = /^\d+$/.test(actualId);
        if (isnum && actualId.length === 8) {
          try {
            await PaidIdController.addId(actualId);
            logger.info(`Successfully created paid id ${actualId}`);
          } catch (e) {
            logger.error(`Error creating paid id ${actualId}`);
            return res.status(500).end();
          }
        } else {
          logger.error(`Invalid id ${actualId}`);
          hadErrors = true;
        }
      }
    } catch (e) {
      logger.error(`Error splitting or adding id ${id}`);
      return res.status(500).end();
    }
  }
  return res.status(hadErrors ? 402 : 200).end();
});
module.exports = router;
