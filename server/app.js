const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const notify = require("./routes/notify");
const admin = require("./routes/admin");
const account = require("./config/config").account;
const app = express();
const basicAuth = require("express-basic-auth");
// Add security headers and options
require("./utils/security")(app);
// view engine setup
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));
app.use("/", notify);
const username = account.user;
const password = account.pass;
const users = {};
users[username] = password;
app.use(
  "/admin",
  basicAuth({
    users,
    challenge: true,
    realm: "soc",
  }),
  admin
);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  if (!res.headersSent) {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    // render the error page
    res.statusCode = err.status || 500;
    return res.render("error");
  } else {
    return res.end();
  }
});
module.exports = app;
