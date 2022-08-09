const db = require("../core/mongo");
const mongoose = require("mongoose");
const { getSemester } = require("../utils/semester");
//Main schema. One entry per section per user
const paidId = new mongoose.Schema({
  semester: {
    type: String,
    default: () => {
      return getSemester();
    },
  },
  paidId: String,
  date: {
    type: Date,
    default: new Date().toISOString(),
  },
});
module.exports = db.model("paidIds", paidId);
