const cron = require('cron');
const StudentController = require("../controllers/StudentController");
const logger = require('log4js').getLogger("department");
const ONE_SECOND = 1000;
/*
Cron job that runs every 15 minutes. Pulls newest classes
Time interval changed to 1 hour during non-registration time
*/

cron.job("* */15 * * * *", async () => {
    logger.info('Hard Class Refresh Starting');
    refreshDepartments(await StudentController.getAllWatchedDepartments());
}).start();

StudentController.getAllWatchedDepartments().then((data) => {
    refreshDepartments(data);
});

function refreshDepartments(departments) {

    //Headers so they know who's pulling their information
    const headers = {
        'DNT': '1',
        'User-Agent': 'http://jonlu.ca/soc_api',
        'Cache-Control': 'max-age=0'
    };

    let options = {
        url: `http://web-app.usc.edu/web/soc/api/classes/20181?refresh=Mary4adAL1ttleLamp`,
        headers,
        timeout: 2 * 60 * ONE_SECOND
    };

    for (const department of departments) {

        options.url = `http://web-app.usc.edu/web/soc/api/classes/${department}/20181?refresh=Mary4adAL1ttleLamp`;

        request(options, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                parseCourses(body);
            }
            else {
                logger.warn(`Error refreshing department ${department}`);
                retryRefreshWithoutHardPull(department);
            }
        });
    }
}

function retryRefreshWithoutHardPull(department) {
    const headers = {
        'DNT': '1',
        'User-Agent': 'http://jonlu.ca/soc_api',
        'Cache-Control': 'max-age=0'
    };
    let options = {
        url: `http://web-app.usc.edu/web/soc/api/classes/${department}/20181`,
        headers,
        timeout: 2 * 60 * ONE_SECOND
    };
    setTimeout(() => {
        request(options, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                parseCourses(body);
            }
            else {
                logger.error(`Error refreshing department ${department} - no refresh key`);
            }
        });
    }, 30 * ONE_SECOND);
}

function parseCourses(body) {
    try {
        let departmentInfo = JSON.parse(body);
        /*Object key checks for returned JSON - the Schedule of Classes API is a bit finicky and not very reliable*/
        if (departmentInfo && departmentInfo.Dept_Info && departmentInfo.Dept_Info.abbreviation) {
            const departmentName = information.Dept_Info.abbreviation;
            StudentController.getStudentsByDepartment(departmentName, (students) => {
                console.log(students);
            });
        }
        else {
            logger.error("Courses error: " + JSON.stringify(departmentInfo));
        }
    } catch (e) {
        logger.error("Error parsing returned JSON: ");
        logger.error(e.message); // error in the above string (in this case, yes)!
    }
}