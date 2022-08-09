const springRegMonths = [10, 11, 12, 1, 2]; // oct, nov, dec, jan, feb are when you can register for spring classes
const fallRegMonths = [3, 4, 5, 6, 7, 8, 9]; // mar, apr, may, jun, jul, aug, sep are when you can register for fall classes
const logger = require("log4js").getLogger("department");
function getSemester() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  // semesters work like 20213, 20211, etc
  // we only want to really watch for spring and fall, since summer isnt supported
  if (springRegMonths.includes(month)) {
    return `${year}1`;
  }
  if (fallRegMonths.includes(month)) {
    return `${year}3`;
  }
  logger.error(`Invalid month ${month}`);
  return `${year}3`;
}
module.exports = { getSemester };
