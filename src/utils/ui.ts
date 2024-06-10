export const formatAbbreviatedNumber = (num: number | bigint): string => {
  num = Number(num);
  if (num < 1000) {
    return num.toString();
  }
  if (num >= 1000 && num < 10000) {
    return (num / 1_000).toFixed(1) + "k";
  }
  if (num >= 10000 && num < 1000000) {
    return Math.round(num / 1_000) + "k";
  }
  if (num >= 1000000 && num < 10000000) {
    return (num / 1_000_000).toFixed(1) + "M";
  }
  return Math.round(num / 1000000) + "M";
};
