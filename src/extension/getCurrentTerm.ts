import { parseSemesterTerm } from "@/utils/semester";

export function getCurrentTerm() {
  const urlSemester = parseSemesterTerm(window.location.pathname);
  if (urlSemester) {
    return urlSemester;
  }

  return parseSemesterTerm(document.getElementById("activeTermTab")?.textContent) || "";
}
