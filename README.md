# USC-Class Notifier API

USC Class Notifier API is a free to use web API for notifications for the number of spots available in each section at USC. It uses Express as its server and MongoDB as its database and is able to send out emails as needed. It also preserves security (more than enough for a project of this nature) by requiring email authentication for use.


## Utilizing the API

There are only three end-points to soc_api. This service is open to any developers, provided they abide by the rate limits and license.


### Registration

| Endpoint | Parameters |
| -------- | -------- |
| https://jonlu.ca/soc_api/notify | POST: `email, courseid, department, phone` |

A sample AJAX POST request looks like:

```
$.ajax({
    method: 'POST',
    url: "https://jonlu.ca/soc_api/notify",
    type: 'json',
    data: {
        email: email,
        courseid: courseid,
        department: department,
        phone: phone
    },
    success: function(data, textStatus, jqXHR) {
        //Handle data and status code here
    }
});
```

| Field  | About |
| ------------- | ------------- |
| email | Validated email address of user  |
| courseid  | Section id of class they would like to be notified on (i.e. 31027)  |
| department | Department within USC in which that section resides |
| phone | Optional phone parameter |

Valid sample data:

| Field  | About |
| ------------- | ------------- |
| email | jdecaro@usc.edu  |
| courseid  | 61400  |
| department | SI |
| phone | 1234567890 |

This would be a valid request to be notified about section 61400 in the SI department. This class specifically maps to `Changing Family Forms`, a GE 6. Any request missing any of these three parameters is discarded.

The response is based entirely off of the HTTP status code.

| Status Code  | Error Type |
| ------------- | ------------- |
| 200 | Registered successfully  |
| 201 | Registered successfully, did not send a verification email because user has already verified  |
| 400  | Response data will contain a field `error` with details on the error  |
| 501 | Database insertion error (contact jdecaro@usc.edu if you ever receive this error) |


### Unregistering

To manually remove a user from being notified of a section, you can use the `remove` endpoint.

| Endpoint | Parameters |
| -------- | -------- |
| https://jonlu.ca/soc_api/remove | POST: `email, key` |

A sample AJAX POST request looks like:

```
$.ajax({
    method: 'POST',
    url: "https://jonlu.ca/soc_api/notify",
    type: 'json',
    data: {
        email: email,
        key: key
    },
    success: function(data, textStatus, jqXHR) {
                //Handle data and status code here
    }
});
```

| Field  | About |
| ------------- | ------------- |
| email | Validated email address of user  |
| key  | Random 32 character key sent with the original verification email  |

The response is based entirely off of the HTTP status code.

| Status Code  | Error Type |
| ------------- | ------------- |
| 200 | Unregistered successfully  |
| 400  | Response data will contain a field `error` with details on the error  |

## Database schema

```
//Main schema. One entry per section per user
const schema = new mongoose.Schema({
    email: String,
    section: String,
    department: { //epartment
        type: String,
        default: ""
    },
    key: String, //random key for verification
    phone: { //date of insertion
        type: String,
        default: ""
    },
    date: { //date of insertion
        type: Date,
        default: new Date().toISOString()
    },
    email_sent: { //have they been sent an email for this section?
        type: Boolean,
        default: false
    },
    valid: { //Have they verified their email?
        type: Boolean,
        default: false
    },
    manually_delete: { //Did they request manual deletion? only available through API right now
        type: Boolean,
        default: false
    },
    text_enabled: { //Are text message notifs enabled?
        type: Boolean,
        default: false
    },
    ip: String,
    uid: String,
    semester: {
        type: String,
        default: semester
    }
});


```

| Field  | About |
| ------------- | ------------- |
| email | Validated email address of user  |
| section  | Section id of class they would like to be notified on (i.e. 31027)  |
| department | Department within USC in which that section resides |
| key | 32 character random user key, used for verification and removal from database |
| phone | The associated phone number for text message notifications |
| date | Date of insertion, ISO-formatted string |
| email_sent | soc\_api defaults to only sending an email only once if spots open up for a class. If it sends an email, this gets set to true and they will not be notified if the class opens again in the future |
| valid | Whether they've verified their email address by clicking on the verification email link |
| manually_delete | Whether they've asked not to be notified manually, through the link in their email |
| text_enabled | Whether to send text notifications for that user |
| semester | Which semester they are registered for, according to USCs data (20173 is Fall 2017)|

## Web framework and Tech

This is  be robust enough to handle something as small as the subset of students at USC that will utilize the chrome extension. If you have plans to expand or mass-market this API, please contact me.

There still needs to be major refactoring, as the current style is not up to par with industry style guidelines. This application works best in conjunction with [USC Schedule Helper](https://chrome.google.com/webstore/detail/usc-schedule-helper/gchplemiinhmilinflepfpmjhmbfnlhk)


## Logging

There are currently 3 log files implemented.

| Log  | About |
| ------------- | ------------- |
| access.log | Apache-like access logs for the HTTP server  |
| department.log  | Logs that have anything to do with department fetching/refershing  |
| notification.log | Logs that have anything to do with user data, notifications, and default console output |

Additionally, `department.log` and `notification.log` have varying levels of logging. These indicate the severity of the log.

| Level  | About |
| ------------- | ------------- |
| trace | Generic information about entering functions, moving within the codebase, and on any action. Fairly noisy |
| debug  | Helpful debugging information |
| info | General information on the application, including most unique/interesting logs |
| warn | An error might have occurred, or possibly something unexpected. |
| error | An error occurred. Highest severity, requires investigation |

## Rate Limits

You are limited to 100 calls per 15 minute period.

## Notes by author

This API is free to use and will be maintained at least until December 2018 (when the author graduates). If any CS student is interested in taking over the project or contributing, feel free to make a pull request.

Additionally I've changed the refresh rate to 45 minutes over the summer so as to not hammer the USC servers.