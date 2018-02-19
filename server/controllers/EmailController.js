const config = require('../config/config.js');
const SparkPost = require('sparkpost');
const client = new SparkPost(config.sparkpost.secret);
const logger = require('log4js').getLogger("notification");
const ejs = require("ejs");
let EmailController = {};

EmailController.sendVerificationEmail = (email, key) => {

  const url = `https://jonlu.ca/soc_api/verify?email=${email}&key=${key}`;
  const text = "Hello! <br> <br> Please verify your account by clicking the following link!";
  let templateData = {
    url,
    text,
    preheader: 'Verify Email - USC Schedule Helper!',
    button_text: 'Verify Email'
  };

  ejs.renderFile("./public/data/template.ejs", templateData, (err, html) => {
    if (err) {
      logger.error("Error rendering ejs!");
      logger.error(err);
      return;
    } // Handle error
    client.transmissions.send({
      content: {
        from: 'no-reply@jonlu.ca',
        subject: 'Verify Email - USC Schedule Helper',
        html
      },
      recipients: [{
        address: email
      }]
    }).then(() => {
      logger.info(`Sent verification email to ${email} with key ${key}`);
    }).catch(err => {
      logger.error(`Whoops! Something went wrong verifying ${email}`);
      logger.error(err);
    });
  });

};

EmailController.sendSpotsAvailableEmail = (email, content, section) => {
  const reset_url = "https://jonlu.ca/soc_api/verify?email=" + email + "&key=" + key;
  let text = `Hello! <br> <br> You are receiving this email because you requested to be notified when spots opened up for ${section.PublishedCourseID}, ${}.<br> <br> `;
  if (spots_available > 1) {
    text += `There are now ${spots_available} spots available. <br> <br> You will not receive this email again.`;
  } else {
    text += `There is now ${spots_available} spot available. <br> <br> You will not receive this email again.<br>`;
  }
  text += ` <br> Please note this service will not work if the class is not actually full (i.e. if spots haven't been "released" yet). <b>This is true for most GE's and GESM! It will continue sending notifications if the spots have not been released, until the class is actually full. </b> <br> <p style="font-size:10px"><a href="mailto:jdecaro@usc.edu">Made with ♥ in Los Angeles</a></p>`;
  let templateData = {
    url: reset_url,
    text: text,
    preheader: 'Spots are available!',
    button_text: 'Click here to continue receiving emails for this section'
  };
  ejs.renderFile(template, templateData, (err, html) => {
    if (err) {
      logger.error(err);
    }
    client.transmissions.send({
      content: {
        from: 'no-reply@jonlu.ca',
        subject: `Spots open for ${classID}`,
        html: content
      },
      recipients: [{
        address: email
      }]
    }).then(() => {
      logger.info(`Spots are open for ${classID}. Sent email to ${email}`);
    }).catch(err => {
      logger.error(`Whoops! Something went wrong sending an email saying there are open spots to ${email}`);
      logger.error(err);
    });
  });

};
module.exports = EmailController;