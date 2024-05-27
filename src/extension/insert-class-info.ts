import type { ClassInfo } from "~/extension/utils";
import $ from "jquery";

export function insertTotalSpots(element: HTMLElement, classInfo: ClassInfo) {
  const { classAvailableSpots } = classInfo;
  const nameElem = $(element).prev();
  const name = $(nameElem).find(".course-title-indent");
  if ($(name).find(".spots_remaining").length) {
    $(name).find(".spots_remaining").remove();
  }
  const spotStr = classAvailableSpots === 1 ? " spot" : " spots";
  const spotsRemainingString = `<span class="crsTitlCustom spots_remaining"> - ${classAvailableSpots} Lecture ${spotStr} available</span>`;
  name.append(spotsRemainingString);
  //Let's make the background red if no spots remaining
  if (classAvailableSpots === 0) {
    $(name).addClass("closed");
  }
}

export function insertClosedRegistration(element: HTMLElement, classInfo: ClassInfo) {
  const { currentSectionHasDiscussion, classDiscussionAvailableSpots } = classInfo;
  const nameElem = $(element).prev();
  const name = $(nameElem).find(".course-title-indent");
  // if we already have .spots_remaining, we want to replay it instead
  if ($(name).find(".spots_remaining").length) {
    $(name).find(".spots_remaining").remove();
  }
  if (currentSectionHasDiscussion) {
    name.append(
      `<span class="crsTitlCustom spots_remaining"> - closed registration (${classDiscussionAvailableSpots} spots remaining)</span>`,
    );
  } else {
    name.append(`<span class="crsTitlCustom spots_remaining"> - closed registration</span>`);
  }
  //Let's make the background red if no spots remaining
  $(name).addClass("closed");
}

export function insertOnlyLabNumbers(element: HTMLElement, classInfo: ClassInfo) {
  const { classAvailableSpotsLabOnly } = classInfo;

  const nameElem = $(element).prev();
  const name = $(nameElem).find(".course-title-indent");
  if ($(name).find(".spots_remaining").length) {
    $(name).find(".spots_remaining").remove();
  }
  name.append(
    `<span class="crsTitlCustom spots_remaining"> - ${classAvailableSpotsLabOnly} remaining lab spots</span>`,
  );
  if (classAvailableSpotsLabOnly === 0) {
    $(name).addClass("closed");
  }
}

export function insertAllOverlap(element: HTMLElement) {
  const nameElem = $(element).prev();
  const name = $(nameElem).find(".course-title-indent");
  //Let's make the background orange if all lectures overlap
  if ($(name).hasClass("closed")) {
    $(name).addClass("closedAndOverlaps");
  } else {
    $(name).addClass("overlaps");
  }
}
