const config = require("../config/config.js");
// Load the AWS SDK for Node.js
const ses = require("node-ses");
const client = ses.createClient({
  key: config.aws.key,
  secret: config.aws.secret,
});
const logger = require("log4js").getLogger("notification");
const ejs = require("ejs");
const template = "./public/data/template.ejs";
let EmailController = {};
EmailController.sendVerificationEmail = (email, key) => {
  const url = `https://jonlu.ca/soc/verify?email=${email}&key=${key}`;
  const text =
    "Hello! <br> <br> Please verify your account by clicking the following link!";
  let templateData = {
    url,
    text,
    preheader: "Verify Email - USC Schedule Helper!",
    button_text: "Verify Email",
  };
  ejs.renderFile(template, templateData, (err, html) => {
    if (err) {
      logger.error("Error rendering ejs!");
      logger.error(err);
      return;
    } // Handle error
    const from = "schedule-helper@jonlu.ca";
    const subject = "Verify Email - USC Schedule Helper";
    EmailController._sendEmail(from, subject, email, html)
      .then(() => {
        logger.info(`Sent verification email to ${email} with key ${key}`);
      })
      .catch((err) => {
        logger.error(`Whoops! Something went wrong verifying ${email}`);
        logger.error(err);
      });
  });
};
EmailController.sendSpotsAvailableEmail = (email, key, section, count) => {
  const watchAgainUrl = `https://jonlu.ca/soc/verify?email=${email}&key=${key}&section=${section.sectionNumber}`;
  const personText = count == 1 ? "person" : "people";
  const verbText = count == 1 ? "is" : "are";
  const otherPeople =
    count > 0
      ? `${count || "0"} other ${personText} ${verbText} watching this section.`
      : "";
  let text = `Hello! <br> <br> You are receiving this email because you requested to be notified when spots opened up for ${section.courseID}, ${section.courseName} - Section ${section.sectionNumber}.<br> <br> `;
  let suffix = section.available > 1 ? "s" : "";
  text += `There ${section.available > 1 ? "are" : "is"} now ${
    section.available
  } spot${suffix} available. ${otherPeople} <br> <br> You will not be notified again unless you click the button.<br>`;
  text += ` <br> Please note this service will not work if the class is not actually full (i.e. if spots haven't been "released" yet). 
 <b>This is true for most GE's and GESM! It will continue sending notifications if the spots have not been released, until the class is actually full. </b> 
 <br>`;
  const templateData = {
    url: watchAgainUrl,
    text: text,
    preheader: `Spots are available for ${section.courseName}!`,
    button_text: "Click here to continue receiving emails for this section",
  };
  ejs.renderFile(template, templateData, (err, html) => {
    if (err) {
      logger.error(err);
    }
    const from = "no-reply@jonlu.ca";
    const subject = `${section.available} spot${
      section.available > 1 ? "s" : ""
    } open for ${section.courseID}`;
    EmailController._sendEmail(from, subject, email, html)
      .then(() => {
        logger.info(
          `Spots are open for ${section.courseName} - ${section.courseID} (${section.sectionNumber}). Sent email to ${email}`
        );
      })
      .catch((err) => {
        logger.error(
          `Whoops! Something went wrong sending an email saying there are open spots to ${email}`
        );
        logger.error(err);
      });
  });
};

EmailController.sendNowWatchingEmail = (email, key, section) => {
  const viewInfo = `https://jonlu.ca/soc/verify?email=${email}&key=${key}&section=${section.sectionNumber}`;
  let fullCourseId = section.fullCourseId;
  let fallbackName = `${section.department} - ${section.sectionNumber}`;
  let headerTitle = fullCourseId || fallbackName;
  let text = `Hello!<br>You are now watching ${headerTitle}.<br/> <br/> You can view all your watched sections, view the IDs to venmo for text notifications, and update your phone number at the link below. 
 <br>`;
  const templateData = {
    url: viewInfo,
    text: text,
    preheader: `Watching ${headerTitle}`,
    button_text: "View All Watched Sections",
  };
  ejs.renderFile(template, templateData, (err, html) => {
    if (err) {
      logger.error(err);
    }
    const from = "no-reply@jonlu.ca";
    const subject = `Watching ${headerTitle}`;
    EmailController._sendEmail(from, subject, email, html)
      .then(() => {
        logger.info(`Sent email to ${email}: Watching ${headerTitle}`);
      })
      .catch((err) => {
        logger.error(
          `Whoops! Something went wrong sending an email saying they are now watching section ${section.sectionNumber} to ${email}`
        );
        logger.error(err);
      });
  });
};
EmailController._sendEmail = async (from, subject, address, html) => {
  return new Promise((resolve, reject) => {
    client.sendEmail(
      {
        to: address,
        from,
        subject,
        message: html,
        altText: html,
      },
      function (err, data, res) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      }
    );
  });
};
module.exports = EmailController;
