const cron = require('cron');
const logger = require('log4js').getLogger("department");
const request = require("request");
/*---CONFIG---*/
const config = require("../config/config");
const ONE_SECOND_MS = 1000;
const timeout = 5 * 60 * ONE_SECOND_MS;

/*---CONTROLLERS---*/
const StudentController = require("../controllers/StudentController");
const ClassController = require("../controllers/ClassController");
/*
 Cron job that runs every 15 minutes. Pulls newest classes
 Time interval changed to 1 hour during non-registration time
 */

cron.job("0 */5 * * * *", async () => {
  refresh();
}).start();

async function refresh() {
  logger.info('Hard Class Refresh Starting');
  refreshDepartments(await StudentController.getAllWatchedDepartments());
}

function refreshDepartments(departments) {
  // On every refresh make sure we mark all accounts that have paid as paid
  StudentController.markAccountsAsPaid();
  /*If data was invalid/uniterable, return (fail silently)*/
  if (!departments) {
    return;
  }
  //Headers so they know who's pulling their information
  const headers = {
    'DNT': '1',
    'User-Agent': 'https://jonlu.ca/soc/ Class Refresher',
    'Cache-Control': 'max-age=0'
  };

  let options = {
    url: `http://web-app.usc.edu/web/soc/api/classes/${config.semester}?refresh=Mary4adAL1ttleLamp`,
    headers,
    timeout: timeout
  };

  for (const department of departments) {

    options.url = `http://web-app.usc.edu/web/soc/api/classes/${department}/${config.semester}?refresh=Mary4adAL1ttleLamp`;

    request(options, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        parseCourses(body);
      } else {
        logger.warn(`Error refreshing department ${department}`);
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
    'DNT': '1',
    'User-Agent': 'http://jonlu.ca/soc',
    'Cache-Control': 'max-age=0'
  };
  let options = {
    url: `http://web-app.usc.edu/web/soc/api/classes/${department}/${config.semester}`,
    headers,
    timeout
  };
  setTimeout(() => {
    request(options, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        parseCourses(body);
      } else {
        logger.warn(`Error refreshing department ${department} even without the database refresh key`);
      }
    });
  }, 30 * ONE_SECOND_MS);
}

async function parseCourses(body) {
  try {
    let departmentInfo = JSON.parse(body);
    /*Object key checks for returned JSON - the Schedule of Classes API is a bit finicky and not very reliable*/
    if (departmentInfo && departmentInfo.Dept_Info && departmentInfo.Dept_Info.abbreviation) {

      const departmentName = departmentInfo.Dept_Info.abbreviation;
      let students = await StudentController.getStudentsByDepartment(departmentName);
      let courses = new ClassController(departmentInfo);
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
        await StudentController.notifyUser(student, course);
        section.notified = true;
        studentWasNotified = true;
      }
    }
    if (studentWasNotified) {
      student.markModified('sectionsWatching');
      await student.save(function (err) {
        if (err) {
          console.log(err);
        }
      });
    }

  }
}

module.exports = refresh;