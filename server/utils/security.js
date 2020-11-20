const RateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const accessLogStream = fs.createWriteStream(path.join(__dirname, '../logs/access.log'), {
  flags: 'a'
});
const limiter = new RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 30 requests per windowMs
});
module.exports = function (app) {
  app.use(limiter);
  //Apache-like logs
  app.set('trust proxy', true);
  app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', {
    stream: accessLogStream
  }));
};