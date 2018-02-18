const helmet = require('helmet');
const RateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');

const accessLogStream = fs.createWriteStream(path.join(__dirname, '../logs/access.log'), {
  flags: 'a'
});
const limiter = new RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  delayMs: 100 // 100ms cooldown
});

module.exports = function (app) {
  app.use(helmet());
  app.use(cors());
  app.use(limiter);
  //Apache-like logs
  app.set('trust proxy', true);
  app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', {
    stream: accessLogStream
  }));
};