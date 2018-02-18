const mongoose = require('mongoose');
const logger = require('log4js').getLogger("notification");

mongoose.connect("mongodb://localhost/admin");

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.on('open', () => {
  logger.info("Mongo Connected");
});

module.exports = db;

