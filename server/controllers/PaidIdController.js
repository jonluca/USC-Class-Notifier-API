//Twilio variables
const paidId = require('../models/paidIds');
const logger = require('log4js').getLogger("notification");

const PaidIdController = {};

PaidIdController.addId = (id, callback) => {
  const p = new paidId();
  p.id = id;

  p.save((err, paidIdEntry) => {
    if (err) {
      logger.error(`Error saving paid id ${id}: ${err}`);
      return callback(false);
    }
    logger.info(`Succesfully created paid id ${id}`);
    return callback(paidIdEntry);
  });
};

PaidIdController.isIdPaid = async (id) => {
  return await paidId.findOne({
    id
  });
};

module.exports = PaidIdController;