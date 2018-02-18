const config = require('../config/config.js');
const SparkPost = require('sparkpost');
const client = new SparkPost(config.sparkpost.secret);
const logger = require('log4js').getLogger("notification");

let EmailController = {};

EmailController.sendVerificationEmail = (email, content, key) => {
    client.transmissions.send({
        content: {
            from: 'no-reply@jonluca.me',
            subject: 'Verify Email - USC Schedule Helper',
            html: content
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