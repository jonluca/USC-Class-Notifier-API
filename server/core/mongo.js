const mongoose = require("mongoose");
const logger = require("log4js").getLogger("notification");
mongoose.connect("mongodb://localhost/admin", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error:")
);
mongoose.connection.on("open", () => {
  logger.info("Mongo Connected");
});
module.exports = db;
