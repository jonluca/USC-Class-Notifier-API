const express = require("express");
const router = express.Router();
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('admin', {
    title: 'SOC API'
  });
});

/* GET users listing. */
router.get('/users', function (req, res, next) {
  async function test() {
    let people = await notifier.find({}, null, {
      sort: {
        date: 1
      }
    });
    res.send(people);
  }
  test();
});

module.exports = router;

