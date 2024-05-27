import dayjs from "dayjs";
import { splitDays } from "@/extension/utils";
import $ from "jquery";
import { insertAllOverlap } from "./insert-class-info";

import * as Moment from "moment";
import { extendMoment } from "moment-range";
const moment = extendMoment(Moment);
export interface Schedule {
  Data: Datum[];
}

export interface Datum {
  Id: string;
  Term: string;
  Title: string;
  SectionId: string;
  Status: Status;
  Start: Date;
  End: Date;
  StartTimezone: null;
  EndTimezone: null;
  RecurrenceRule: null;
  RecurrenceException: null;
  Description: null;
  IsAllDay: boolean;
}

export enum Status {
  Conflicted = "Conflicted",
  Scheduled = "Scheduled",
}

export async function getCurrentSchedule(): Promise<Schedule | null> {
  const data = await fetch("https://webreg.usc.edu/Calendar");
  const text = await data.text();
  const syncScript = text.split("<script>kendo.syncReady")[1]?.split("\n")[0];
  if (!syncScript) {
    return null;
  }
  // there's a json object of the form "data":{"Data" that we want to parse
  const json = syncScript.split('data":{"Data":')[1]?.split("]")[0];
  if (json) {
    const dataObject = JSON.parse(`{"Data":${json}]}`) as Schedule;
    return dataObject;
  }
  return null;
}

function addConflictOverlay(row: HTMLElement, name: string) {
  const addToCourseBin = $(row).find(".addtomycb, .add-to-course-bin")[0];
  if (!addToCourseBin) {
    return;
  }
  $(row).css("background-color", "rgba(255, 134, 47, 0.37)");
  $($(row).children()[0]).css("background-color", "rgba(255, 134, 47, 0.37)");
  $(addToCourseBin).attr("value", `Overlaps ${name}`);
  // set text content of the button to "Overlaps with [class name]"
  $(addToCourseBin).text(`Overlaps ${name}`);
  $(addToCourseBin).attr("orig_name", `Overlaps ${name}`);
  $(addToCourseBin).attr("title", `This class overlaps with ${name}!`);
  $(addToCourseBin).addClass("warning");
}

export function parseSchedule(data: Schedule) {
  if (!data || !data.Data || !data.Data.length) {
    return;
  }
  const currentScheduleArr: {
    day: string[];
    time: string[];
    section: string;
    classname: string;
  }[] = [];
  for (const singleClass of data.Data) {
    const startTime = dayjs(singleClass.Start);
    const endTime = dayjs(singleClass.End);
    const classInfo = singleClass.Title.split(" ");
    const time = {
      day: [startTime.format("dddd")],
      time: [startTime.format("hh:mma"), endTime.format("hh:mma")],
      section: classInfo[1].slice(1, -2),
      classname: classInfo[0],
    };
    currentScheduleArr.push(time);
  }
  //bail if no classes
  if (currentScheduleArr.length === 0) {
    return;
  }
  //Iterate over every div. The layout of webreg is alternating divs for class name/code and then its content
  $(".accordion-content-area").each(function () {
    let doAllSectionsOverlap = true;
    const sections = $(this).find(".section");

    sections.each(function () {
      try {
        const rows = $(this).find(".section_row").toArray();
        //Get hours for current section
        const secHours = rows
          .find((r) => r.innerText.includes("Time:"))
          ?.innerText?.replace("Time: ", "")
          ?.trim()
          ?.split("-");
        if (!secHours) {
          return;
        }
        //Get days for class for current section
        let secDays = rows.find((r) => r.innerText.includes("Days:"))?.innerText;
        secDays = secDays?.replace("Days: ", "")?.trim();
        const days = splitDays(secDays);
        //Get section name to compare if you already have that class
        let secName = rows.find((r) => r.innerText.includes("Section:"))?.innerText;
        secName = secName?.replace("Section: ", "")?.trim() || "";
        //Get section name to compare if you already have that class

        for (const currClass of currentScheduleArr) {
          if (secName.startsWith(currClass.section)) {
            continue;
          }
          for (const currClassDay of currClass.day) {
            const secDay = days.find((d) => d === currClassDay);
            if (!secDay) {
              continue;
            }
            //Class already registered/scheduled
            const start = moment(currClass.time[0], "hh:mma");
            const end = moment(currClass.time[1], "hh:mma");
            const range = moment.range(start, end);

            const start2 = moment(secHours[0], "hh:mma");
            const end2 = moment(secHours[1], "hh:mma");
            const range2 = moment.range(start2, end2);
            if (range.overlaps(range2)) {
              addConflictOverlay(this, currClass.classname);
              return;
            }
          }
        }
        let secType = rows.find((r) => r.innerText.includes("Type:"))?.innerText;
        secType = secType?.replace("Type: ", "")?.trim();
        if (secType?.startsWith("Lecture")) {
          doAllSectionsOverlap = false;
        }
      } catch (e) {
        console.error(e);
      }
    });
    if (doAllSectionsOverlap) {
      insertAllOverlap(this);
    }
  });
  $(".warning").hover(
    function () {
      // if it has the notify class, set the value to "Notify Me"
      const text = $(this).hasClass("notify") ? "Notify Me" : "Add Anyway";
      $(this).attr("value", text);
      $(this).text(text);
    },
    function () {
      const original = $(this).attr("orig_name");
      if (original) {
        $(this).attr("value", original);
        $(this).text(original);
      }
    },
  );
}
