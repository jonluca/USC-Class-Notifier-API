import $ from "jquery";
import { getProfessorRatings, ratingURLTemplate } from "@/extension/utils";

function parseCoursePage() {
  // Find all mat-header-cell where the text is "Instructor"
  const headerCells = $("mat-header-cell")
    .filter(function () {
      const textValue = $(this).text().trim();
      return textValue === "INSTRUCTOR" || textValue === "INSTRUCTORS";
    })
    .toArray();
  // now for each one, we want to add a new header cell after it
  for (const headerCell of headerCells) {
    if ($(headerCell).next(".rating-header").length === 0) {
      // clone it and change text
      const newHeaderCell = $(headerCell).clone();
      newHeaderCell.text("PROF RATING");
      newHeaderCell.addClass("rating-header");
      // insert after
      $(headerCell).after(newHeaderCell);
    }
    // find its index in the header, then insert the rating for each row at that index + 1
    const headerIndex = $(headerCell).index();
    // now find all rows
    const parent = $(headerCell).closest("mat-table, table");
    if (parent.length === 0) {
      continue;
    }
    const rows = parent.find("mat-row, tr").toArray();
    for (const row of rows) {
      const cells = $(row).find("mat-cell, td").toArray();
      if (cells.length <= headerIndex) {
        continue;
      }
      const instructorCell = cells[headerIndex];
      const instructorNames = (instructorCell.textContent || "").split(",").map((l) => l.trim());
      const toAdd = [] as string[];
      for (const name of instructorNames) {
        const professors = getProfessorRatings(name);
        if (professors) {
          for (const prof of professors) {
            const url = ratingURLTemplate + prof.legacyId;
            toAdd.push(`<a href=${url} style="padding-left: 2px;"  target="_blank">${prof.avgRating || "Link"}</a>`);
          }
        }
      }
      const ratingsHTML = toAdd.join(", ");
      // create new cell
      const newCell = $(instructorCell).clone();
      newCell.addClass("rating");
      newCell.html(ratingsHTML || " ");
      // insert after instructor cell
      if ($(row).find(".rating").length === 0) {
        $(instructorCell).after(newCell);
      } else {
        $(row)
          .find(".rating")
          .html(ratingsHTML || " ");
      }
    }
  }
}
// Create a MutationObserver to watch for mat-table elements
function observeMatTableInsertion(callback: () => void) {
  // Check if an element is or contains a mat-table
  function checkForMatTable(element: HTMLElement) {
    if (element.nodeType !== Node.ELEMENT_NODE) {
      return [];
    }

    const matTables = [];

    // Check if the element itself is a mat-table (class, attribute, or tag)
    if (
      element.classList?.contains("mat-table") ||
      element.hasAttribute?.("mat-table") ||
      element.tagName?.toLowerCase() === "mat-table"
    ) {
      matTables.push(element);
    }

    // Check for mat-table descendants
    const descendants = element.querySelectorAll(".mat-table, [mat-table], mat-table");
    matTables.push(...descendants);

    return matTables;
  }

  // Create the observer
  const observer = new MutationObserver((mutations) => {
    let shouldCallback = false;
    mutations.forEach((mutation) => {
      if (shouldCallback) {
        return;
      }
      // Check added nodes
      mutation.addedNodes.forEach((node) => {
        if (shouldCallback) {
          return;
        }
        const matTables = checkForMatTable(node as HTMLElement);
        if (matTables.length) {
          shouldCallback = true;
        }
      });
    });
    if (shouldCallback) {
      callback();
    }
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Return the observer so it can be disconnected if needed
  return observer;
}

export function initCoursePage() {
  parseCoursePage();
  // Example usage:
  observeMatTableInsertion(() => {
    parseCoursePage();
  });
}
