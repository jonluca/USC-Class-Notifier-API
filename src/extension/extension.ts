import $ from "jquery";
import { initCoursePage } from "@/extension/coursesPage";
import { parseWebRegPage } from "@/extension/webRegPage";
import type { Options } from "@/extension/utils";
import { getCurrentSchedule, parseSchedule } from "@/extension/schedule";
import { getCurrentTerm } from "@/extension/getCurrentTerm";

function insertExportButton() {
  const navbar = $("ul.nav");
  $(navbar).find(".exportCal").remove();

  $(navbar).append(
    `<li><a class="exportCal" href="https://my.usc.edu/ical/?term=${getCurrentTerm()}">Export To Calendar</a></li>`,
  );
  const cals = $(".exportCal");
  $(cals[1]).remove();
}
export const initExtension = (options: Options) => {
  if (!options.enabled) {
    return;
  }
  const currentURL = window.location.href;

  if (currentURL.includes("webreg")) {
    insertExportButton();
    if (!currentURL.includes("/myCourseBin")) {
      getCurrentSchedule().then((data) => {
        if (data) {
          parseSchedule(data);
        }
      });
      // parse web reg
      parseWebRegPage(options);
    }
  } else {
    initCoursePage();
  }
};
