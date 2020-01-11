//Twilio variables
const config = require("../config/config");
const twilio = require('twilio');
const accountSid = config.twilio.sid;
const authToken = config.twilio.auth;
const client = new twilio(accountSid, authToken);

const logger = require('log4js').getLogger("notification");

let TextController = {};

TextController.sendMessage = (number, message) => {
  if (number !== undefined && number !== "") {
    client.messages.create({
      body: message,
      to: number,
      from: config.fromPhoneNumber
    }, (err, message) => {
      if (err) {
        logger.error(`Error sending text to: ${number} with error: ${err}`);
        return;
      }
      logger.debug(`Sent text message to: ${message.to}`);
    });
  }
};

module.exports = TextController;