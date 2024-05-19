const springRegMonthsAddYear = [10, 11, 12]; // oct, nov, dec, jan, feb are when you can register for spring classes
const springRegMonths = [1, 2]; // oct, nov, dec, jan, feb are when you can register for spring classes
const fallRegMonths = [3, 4, 5, 6, 7, 8, 9]; // mar, apr, may, jun, jul, aug, sep are when you can register for fall classes

export function getSemester() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  // semesters work like 20213, 20211, etc
  // we only want to really watch for spring and fall, since summer isnt supported
  if (springRegMonthsAddYear.includes(month)) {
    return `${year + 1}1`;
  }

  if (springRegMonths.includes(month)) {
    return `${year}1`;
  }
  if (fallRegMonths.includes(month)) {
    return `${year}3`;
  }
  console.error(`Invalid month ${month}`);
  return `${year}3`;
}
