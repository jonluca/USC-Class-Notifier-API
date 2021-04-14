//Twilio variables
const paidId = require("../models/paidIds");
const PaidIdController = {};
PaidIdController.addId = async (id) => {
  const p = new paidId();
  p.paidId = id;
  return await p.save();
};
PaidIdController.isIdPaid = async (id) => {
  const doc = await paidId.findOne({
    paidId: id,
  });
  return !!doc;
};
module.exports = PaidIdController;
