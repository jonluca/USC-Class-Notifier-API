import $ from "jquery";
import { createClassesPageNotifyButton } from "@/extension/notify";
import { getProfessorRatings, ratingURLTemplate } from "@/extension/utils";

const COURSE_ID_PATTERN = /\b([A-Z]{2,5}\s+\d+[A-Z]?)\b/;
const TERM_PATTERN = /\/term\/(\d{5})(?:\/|$)/i;

function getTextContent(element: Element | undefined) {
  return element?.textContent?.replace(/\s+/g, " ").trim() || "";
}

function getColumnIndex(cells: Element[], label: string) {
  return cells.findIndex((cell) => getTextContent(cell) === label);
}

function getClassesPageSemester() {
  return window.location.pathname.match(TERM_PATTERN)?.[1] || "";
}

function findCourseIdForTable(element: HTMLElement) {
  let current: HTMLElement | null = element;

  while (current) {
    const candidates = [
      current.getAttribute("aria-label") || "",
      ...$(current)
        .children("button, [role='button'], h1, h2, h3, h4")
        .toArray()
        .map((node) => node.textContent || ""),
      ...$(current)
        .prevAll()
        .toArray()
        .slice(0, 3)
        .flatMap((node) => [
          node.textContent || "",
          ...$(node)
            .find("button, [role='button'], h1, h2, h3, h4")
            .toArray()
            .map((child) => child.textContent || ""),
        ]),
    ];

    for (const candidate of candidates) {
      const match = candidate.replace(/\s+/g, " ").match(COURSE_ID_PATTERN);
      if (match?.[1]) {
        return match[1];
      }
    }
    current = current.parentElement;
  }

  return undefined;
}

function addNotifyButtons(parent: JQuery<HTMLElement>) {
  const headerRow = parent.find("mat-header-row, thead tr, tr").first();
  if (!headerRow.length) {
    return;
  }

  const headerCells = headerRow.find("mat-header-cell, th, td").toArray();
  const sectionIndex = getColumnIndex(headerCells, "SECTION");
  const registeredIndex = getColumnIndex(headerCells, "REGISTERED");
  const detailsIndex = getColumnIndex(headerCells, "DETAILS");

  if (sectionIndex === -1 || registeredIndex === -1) {
    return;
  }

  const fullCourseId = findCourseIdForTable(parent[0]);
  const department = fullCourseId?.split(/\s+/)[0] || "";
  const semester = getClassesPageSemester();
  if (!department) {
    return;
  }
  const rows = parent.find("mat-row, tr").toArray();

  for (const row of rows) {
    const cells = $(row).find("mat-cell, td").toArray();
    if (cells.length <= Math.max(sectionIndex, registeredIndex)) {
      continue;
    }

    const sectionId = getTextContent(cells[sectionIndex]).replace(/\D/g, "");
    const registeredText = getTextContent(cells[registeredIndex]);
    if (!sectionId || !/^\d+\s*\/\s*\d+$/.test(registeredText)) {
      continue;
    }

    const targetCell = detailsIndex >= 0 && cells.length > detailsIndex ? cells[detailsIndex] : cells[cells.length - 1];
    if (!targetCell || $(targetCell).find(".usc-helper-notify-button").length) {
      continue;
    }

    $(targetCell).append(
      $("<div>", { class: "usc-helper-notify-cell" }).append(
        createClassesPageNotifyButton({
          sectionId,
          department,
          fullCourseId,
          semester,
        }),
      ),
    );
  }
}

function parseCoursePage() {
  // Find all mat-header-cell where the text is "Instructor"
  const headerCells = $("mat-header-cell, th")
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
    addNotifyButtons(parent);
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
// Create a MutationObserver to watch for course table elements
function observeMatTableInsertion(callback: () => void) {
  // Check if an element is or contains a relevant table
  function checkForTables(element: HTMLElement) {
    if (element.nodeType !== Node.ELEMENT_NODE) {
      return [];
    }

    const tables = [];

    // Check if the element itself is a table (class, attribute, or tag)
    if (
      element.tagName?.toLowerCase() === "table" ||
      element.classList?.contains("mat-table") ||
      element.hasAttribute?.("mat-table") ||
      element.tagName?.toLowerCase() === "mat-table"
    ) {
      tables.push(element);
    }

    // Check for descendant tables
    const descendants = element.querySelectorAll("table, .mat-table, [mat-table], mat-table");
    tables.push(...descendants);

    return tables;
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
        const tables = checkForTables(node as HTMLElement);
        if (tables.length) {
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
