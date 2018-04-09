const express = require("express");
const router = express.Router();
const students = require("../models/student");
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('admin', {
    title: 'SOC API'
  });
});

/* GET users listing. */
router.get('/users', function (req, res, next) {
  students.find({}, (err, people) => {
    return res.json(people).end();
  });
});

module.exports = router;

