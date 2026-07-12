import assert from "node:assert/strict";
import test from "node:test";
import { parseSemesterTerm } from "@/utils/semester";

test("parses each supported USC term label", () => {
  assert.equal(parseSemesterTerm("Spring 2026"), "20261");
  assert.equal(parseSemesterTerm("Summer 2026"), "20262");
  assert.equal(parseSemesterTerm("Fall 2026"), "20263");
  assert.equal(parseSemesterTerm("  FALL   2026 Classes  "), "20263");
});

test("parses raw term codes and classes URLs", () => {
  assert.equal(parseSemesterTerm("20261"), "20261");
  assert.equal(parseSemesterTerm("/term/20262/catalogue/school/DRNS"), "20262");
  assert.equal(parseSemesterTerm("https://classes.usc.edu/term/20263/?search=IR"), "20263");
});

test("rejects ambiguous and malformed terms", () => {
  for (const value of [
    "Winter 2026",
    "Fall 26",
    "Fall registration 2026",
    "20260",
    "20264",
    "202620261",
    "/term/20264/catalogue",
  ]) {
    assert.equal(parseSemesterTerm(value), undefined, value);
  }
});
