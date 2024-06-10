import $ from "jquery";
import { context } from "@/extension/context";

export function addNotifyMe(section: HTMLElement) {
  const hasNotifyMe = $(section).find(".notify");
  if (hasNotifyMe.length !== 0) {
    return;
  }
  const addToCourseBinSection = $(section).find(".btnAddToMyCourseBin");
  if (!addToCourseBinSection.length) {
    return;
  }

  $(addToCourseBinSection).append(
    `<input name="submit" value="Notify Me" class="btn btn-default addtomycb col-xs-12 notify" type="button">`,
  );
}

// add an event listener for any .notify on document
$(document).on("click", ".notify", function () {
  try {
    const section = $(this).closest(".section")[0];
    if (!section) {
      context.getState().setSelectedClass({ isInvalid: true });
      return;
    }
    const form = $(section).find("form")[0];
    const strings = form?.attributes?.getNamedItem("data-ajax-url")?.textContent?.split("/");
    let id = strings?.[4];
    if (!id) {
      // try and find the id from the parent
      const parent = $(this).closest(".section_crsbin");
      if (parent) {
        const rows = $(parent).find(".section_row").toArray();
        const sectionRow = rows.find((r) => r.innerText.includes("Section"));
        if (sectionRow) {
          // replace any non number characters
          const section = sectionRow.innerText.replace(/\D/g, "");
          if (section) {
            id = section;
          }
        }
      }
    }
    if (!id && form) {
      const inputs = $(form).find("input");
      const sectionInput = inputs.toArray().find((i) => i.id === "sectionid" || i.name === "sectionid");
      if (sectionInput) {
        id = sectionInput.value;
      }
    }
    const titleTopbar = $(form).parents(".accordion-content-area");
    const header = $(titleTopbar).prev();
    //get the department by matching form ID to the row above
    const courseSearch = $(header).find(".crsID");
    let departmentFromAbove = "";
    if (courseSearch.length) {
      const spanElem = $(courseSearch[0]).text();
      const departmentString = spanElem.split("-");
      departmentFromAbove = departmentString[0];
    }

    let fullCourseId;
    if (titleTopbar) {
      const header = $(titleTopbar).prev();
      const text = $(header).find(".crsID").text();
      if (text) {
        const splitcrsId = text.split("-");
        fullCourseId = text.split(" ")[0];
        if (splitcrsId[0] && !departmentFromAbove) {
          departmentFromAbove = splitcrsId[0];
        }
      }
    }
    let semester = "";
    try {
      const termTab = document.getElementById("activeTermTab");
      if (termTab && termTab.textContent) {
        const [term, year] = termTab.textContent.trim().toLowerCase().split(" ");
        if (year && ["fall", "spring"].includes(term)) {
          semester = `${year}${term === "fall" ? "3" : "1"}`;
        }
      }
    } catch (e) {
      console.error(e);
    }
    if (!id) {
      context.getState().setSelectedClass({ isInvalid: true });
      return;
    }
    // we need to construct the class object by pulling info from the section
    const classData = { sectionId: id, fullCourseId, department: departmentFromAbove, semester };
    context.getState().setSelectedClass(classData);
  } catch (e) {
    console.error(e);
    context.getState().setSelectedClass({ isInvalid: true });
  }
});
