//Twilio variables
const paidId = require('../models/paidIds');

const PaidIdController = {};

PaidIdController.addId = async (id) => {
  const p = new paidId();
  p.paidId = id;

  return await p.save();
};

PaidIdController.isIdPaid = async (id) => {
  return await paidId.findOne({
    paidId: id
  });
};

module.exports = PaidIdController;