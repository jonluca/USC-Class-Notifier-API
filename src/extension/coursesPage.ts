import $ from "jquery";
import { getProfessorRatings, isNumber, ratingURLTemplate } from "@/extension/utils";

export function parseCoursePage() {
  //Get all courses
  const courses = $(".course-info");
  let totalSpots = 0;
  let availSpots = 0;
  //Iterate over courses on page
  for (const course of courses) {
    totalSpots = 0;
    availSpots = 0;
    //Get table with jQuery selector
    const table = $(course).find("> .course-details > table.sections");
    //Get rows, iterate over each one
    $(table[0])
      .find("> tbody > tr")
      .each(function () {
        if ($(this).hasClass("headers")) {
          //create new column
          $(this).find(".instructor").after("<th>Prof. Rating</th>");
          //jQuery's version of continue
          return;
        }
        //find Type column
        const tdType = $(this).find("td.type");
        if (tdType.length === 0) {
          return;
        }
        const type = tdType[0].textContent;
        //Get registration numbers
        const registratioNumbers = $(this).find("td.registered")[0].textContent?.split(" of ") || ["0", "0"];
        const currentlyEnrolled = parseInt(registratioNumbers[0]);
        const totalAvailable = parseInt(registratioNumbers[1]);
        //If it's not a lab or quiz
        if (type === "Lecture" || type === "Lecture-Lab") {
          totalSpots += totalAvailable;
          availSpots += totalAvailable - currentlyEnrolled;
        }
        const professor = $(this).find("td.instructor")[0];
        //Professor names are separated by commas, so this handles the case that multiple profs teach a section
        const profName = (professor.textContent || "").split(",");
        for (let i = 0; i < profName.length; i++) {
          const splitProfName = profName[i];
          //Names are formatted "First Last" so no reordering is necessary
          //However, some names are "First Middle Middle2 Last", and we only want "First Last" as that is the format of
          // our json
          const name = splitProfName.split(" ");

          //If its in JSON
          const professors = getProfessorRatings(`${name[0]} ${name[name.length - 1]}`);
          if (professors) {
            //generate RMP URL
            for (const prof of professors) {
              const url = ratingURLTemplate + prof.legacyId;
              //If we've never inserted before, insert. Otherwise insert with a comma before it for good formatting
              if ($(this).find(".rating").length === 0) {
                $(this)
                  .find("td.instructor")
                  .after(`<td class="rating"><a href=${url} target="_blank">${prof.avgRating || "Link"}</a></td>`);
              } else {
                $(this)
                  .find(".rating")
                  .append(`, <a href=${url} target="_blank">${prof.avgRating || "Link"}</a>`);
              }
            }
          } else {
            //If not in JSON, we need an empty space to make table format correctly
            if ($(this).find(".rating").length === 0) {
              $(this).find("td.instructor").after('<td class="rating"> </td>');
            } else {
              $(this).find(".rating").append(" ");
            }
          }
        }
      });
    //insert remaining spots in main
    const title = $(course).find("> .course-id > h3 > a");
    if (totalSpots !== 0 && isNumber(totalSpots)) {
      let availableString = ` - ${availSpots} remaining spot`;
      if (availSpots > 1) {
        availableString += "s";
      }
      if (availSpots === 0) {
        availableString += "s";
        const background = $(course).find("> .course-id");
        $(background).css("background-color", "rgba(240, 65, 36, 0.45)");
      }
      title.append(availableString);
    }
  }
}
