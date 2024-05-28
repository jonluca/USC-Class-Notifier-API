const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
// Add security headers and options
app.set("trust proxy", true);
// view engine setup
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

app.get("/texts-enabled", (req, res, next) => {
    res.send({ enabled: true }).end();
});
/* GET home page. */
app.get("/", (req, res, next) => {
    res.render("landing");
});
app.get("/privacy", (req, res, next) => {
    res.render("privacy");
});
app.get("/terms", (req, res, next) => {
    res.render("terms");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    res.render("landing");
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
