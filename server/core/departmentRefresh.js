const cron = require("cron");
const logger = require("log4js").getLogger("department");
const request = require("request");
/*---CONFIG---*/
const ONE_SECOND_MS = 1000;
const timeout = 5 * 60 * ONE_SECOND_MS;
/*---CONTROLLERS---*/
const StudentController = require("../controllers/StudentController");
const ClassController = require("../controllers/ClassController");
const { getSemester } = require("../utils/semester");
/*
 Cron job that runs every 5 minutes. Pulls newest classes
 Time interval changed to 1 hour during non-registration time
 */
cron
  .job("0 */5 * * * *", async () => {
    refresh();
  })
  .start();

async function refresh() {
  logger.info("Hard Class Refresh Starting");
  refreshDepartments(await StudentController.getAllWatchedDepartments());
}

function refreshDepartments(departments) {
  /*If data was invalid/uniterable, return (fail silently)*/
  if (!departments) {
    return;
  }
  const semester = getSemester();
  //Headers so they know who's pulling their information
  const headers = {
    DNT: "1",
    "User-Agent": "https://jldc.me/soc/ Class Refresher",
    "Cache-Control": "max-age=0",
  };
  let options = {
    url: `http://web-app.usc.edu/web/soc/api/classes/${semester}?refresh=Mary4adAL1ttleLamp`,
    headers,
    timeout: timeout,
  };
  for (const department of departments) {
    options.url = `http://web-app.usc.edu/web/soc/api/classes/${department}/${semester}?refresh=Mary4adAL1ttleLamp`;
    request(options, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        parseCourses(body);
      } else {
        retryRefreshWithoutHardPull(department);
      }
    });
  }
}

function retryRefreshWithoutHardPull(department) {
  if (!department) {
    return;
  }
  const headers = {
    DNT: "1",
    "User-Agent": "http://jldc.me/soc",
    "Cache-Control": "max-age=0",
  };
  let options = {
    url: `http://web-app.usc.edu/web/soc/api/classes/${department}/${getSemester()}`,
    headers,
    timeout,
  };
  setTimeout(() => {
    request(options, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        parseCourses(body);
      } else {
        logger.warn(
          `Error refreshing department ${department} even without the database refresh key`
        );
      }
    });
  }, 30 * ONE_SECOND_MS);
}

async function parseCourses(body) {
  try {
    const departmentInfo = JSON.parse(body);
    /*Object key checks for returned JSON - the Schedule of Classes API is a bit finicky and not very reliable*/
    if (
      departmentInfo &&
      departmentInfo.Dept_Info &&
      departmentInfo.Dept_Info.abbreviation
    ) {
      const departmentName = departmentInfo.Dept_Info.abbreviation;
      const students = await StudentController.getStudentsByDepartment(
        departmentName
      );
      const courses = new ClassController(departmentInfo);
      for (const student of students) {
        await checkAvailability(student, courses);
      }
    } else {
      logger.error("Courses error: " + JSON.stringify(departmentInfo));
    }
  } catch (e) {
    logger.error("Error parsing returned JSON: ");
    logger.error(e.message); // error in the above string (in this case, yes)!
  }
}

async function checkAvailability(student, courses) {
  if (student && student.sectionsWatching) {
    let studentWasNotified = false;
    /*For each section they are watching*/
    for (const section of student.sectionsWatching) {
      let course = courses.getSection(section.sectionNumber);
      /*If the course has available spots, notify them*/
      if (course && course.available > 0 && !section.notified) {
        const count =
          await StudentController.getNumberOfStudentsWatchingSection(
            section.sectionNumber,
            section.department
          );
        await StudentController.notifyUser(
          student,
          course,
          count,
          section.rand,
          section
        );
        section.notified = true;
        studentWasNotified = true;
      }
    }
    if (studentWasNotified) {
      student.markModified("sectionsWatching");
      await student.save(function (err) {
        if (err) {
          logger.error(err);
        }
      });
    }
  }
}

module.exports = refresh;
