const express = require("express");
const router = express.Router();
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('admin', {
    title: 'SOC API'
  });
});

/* GET users listing. */
router.get('/users', async function (req, res, next) {
  let people = await notifier.find({}, null, {
    sort: {
      date: 1
    }
  });
  res.send(people);
});

module.exports = router;

