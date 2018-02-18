const cron = require('cron');
const StudentController = require("../controllers/StudentController");
const logger = require('log4js').getLogger("department");

/*
Cron job that runs every 15 minutes. Pulls newest classes
Time interval changed to 1 hour during non-registration time
*/

cron.job("* */15 * * * *", async () => {
    logger.info('Hard Class Refresh Starting');
    refreshDepartments(await StudentController.getAllWatchedDepartments());
}).start();

refreshDepartments(StudentController.getAllWatchedDepartments());


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
        timeout: 120000
    };

    for (const department of departments) {

        options.url = `http://web-app.usc.edu/web/soc/api/classes/${department}/20181?refresh=Mary4adAL1ttleLamp`;

        request(options, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                parseCourses(body);
            }
            else {
                logger.warn(`Error refreshing department ${department}`);
                options.url = `http://web-app.usc.edu/web/soc/api/classes/${department}/20181`;
                setTimeout(() => {
                    request(options, (error, response, body) => {
                        if (!error && response.statusCode === 200) {
                            parseCourses(body);
                        }
                        else {
                            departmentLog.error(`Error refreshing regular department ${department}`);
                        }
                    });
                }, 30 * 1000);

            }
        });
    }
}

function parseCourses(body) {
    console.log(body);
}