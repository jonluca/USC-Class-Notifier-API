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
    }).then(data => {
      logger.info(`Sent verification email to ${email} with key ${key}`);
    }).catch(err => {
      logger.error(`Whoops! Something went wrong verifying ${email}`);
      logger.error(err);
    });
  });

};

EmailController.sendSpotsAvailableEmail = (email, content, classID) => {
  client.transmissions.send({
    content: {
      from: 'no-reply@jonlu.ca',
      subject: `Spots open for ${classID}`,
      html: content
    },
    recipients: [{
      address: email
    }]
  }).then(data => {
    logger.info(`Spots are open for ${classID}. Sent email to ${email}`);
  }).catch(err => {
    logger.error(`Whoops! Something went wrong sending an email saying there are open spots to ${email}`);
    logger.error(err);
  });
};
module.exports = EmailController;