const springRegMonthsAddYear = [10, 11, 12]; // oct, nov, dec, jan, feb are when you can register for spring classes
const springRegMonths = [1, 2]; // oct, nov, dec, jan, feb are when you can register for spring classes
const fallRegMonths = [3, 4, 5, 6, 7, 8, 9]; // mar, apr, may, jun, jul, aug, sep are when you can register for fall classes

// in fall you can register for fall and spring
// in spring you can register for spring, and fall
// in summer you can register for summer and fall
export function getCurrentSemester() {
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

export function getValidSemesters() {
  // we want to get this years (1, 2, 3) and next years (1)
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  // dont include spring of this year if we are past the registration date
  const terms: string[] = [`${year}2`, `${year}3`];
  if (month >= 10) {
    terms.unshift(`${year + 1}1`);
  }
  if (month < 4) {
    terms.unshift(`${year}1`);
  }
  return terms;
}

export const MONTHS = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};
export const SPRING_REGISTRATION_RANGE = [
  MONTHS.October,
  MONTHS.November,
  MONTHS.December,
  MONTHS.January,
  MONTHS.February,
];
export const SUMMER_REGISTRATION_RANGE = [
  MONTHS.February,
  MONTHS.March,
  MONTHS.April,
  MONTHS.May,
  MONTHS.June,
  MONTHS.July,
];
export const FALL_REGISTRATION_RANGE = [
  MONTHS.March,
  MONTHS.April,
  MONTHS.May,
  MONTHS.June,
  MONTHS.July,
  MONTHS.August,
  MONTHS.September,
];
