import $ from "jquery";

export function getCurrentTerm() {
  const curTabText = $("#activeTermTab")?.text()?.trim()?.toLowerCase();
  let semester = "";
  if (curTabText) {
    // this might be like "Fall 2025 Classes" - extract the year and the semester, then fill that in for term below
    const year = parseInt(curTabText.replace(/[^0-9]/g, ""));
    if (year) {
      const semesterVal = curTabText.includes("spring")
        ? "1"
        : curTabText.includes("summer")
          ? "2"
          : curTabText.includes("fall")
            ? "3"
            : "1";
      semester = `${year}${semesterVal}`;
    }
  }
  return semester;
}