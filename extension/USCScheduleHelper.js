let options;
let id;
let textsEnabled = undefined;
const venmoImage = chrome.runtime.getURL("images/venmo.png");
const venmoQrImage = chrome.runtime.getURL("images/venmo-qr.jpeg");

function addPostRequests() {
  $(".notify").each(function () {
    const form = $(this)[0].form;
    $(this).attr("value", "Notify Me");
    $(this).unbind();
    $(this).attr("type", "button");
    $(this).unbind("mouseenter mouseleave");
    const strings = form.attributes["data-ajax-url"]?.textContent.split("/");
    let id = strings?.[4];
    if (!id) {
      // try and find the id from the parent
      const parent = $(this).closest(".section_crsbin");
      if (parent) {
        const rows = $(parent).find(".section_row").toArray();
        const sectionRow = rows.find((r) => r.innerText.includes("Section"));
        if (sectionRow) {
          // replace any non number characters
          const section = sectionRow.innerText.replace(/\D/g, "");
          if (section) {
            id = section;
          }
        }
      }
    }
    if (!id) {
      console.warn("No id found for notify button, skipping.");
      return true;
    }
    const titleTopbar = $(form).parents(".accordion-content-area");
    const header = $(titleTopbar).prev();
    //get the department by matching form ID to the row above
    const courseSearch = $(header).find(".crsID");
    let departmentFromAbove = "";
    if (courseSearch.length) {
      const spanElem = $(courseSearch[0]).text();
      const departmentString = spanElem.split("-");
      departmentFromAbove = departmentString[0];
      if (departmentFromAbove) {
        this.department = departmentFromAbove;
      }
    }

    let fullCourseId;
    if (titleTopbar) {
      const header = $(titleTopbar).prev();
      fullCourseId = $(header).find(".crsID");
      const text = fullCourseId.text();
      if (fullCourseId && text) {
        const splitcrsId = text.split("-");
        fullCourseId = text.split(" ")[0];
        if (splitcrsId[0]) {
          this.department = splitcrsId[0];
        }
      }
    }
    const courseid = id;
    $(this).click(async () => {
      let currentDepartmentYearText = "";
      try {
        const topNav = $("nav").find('[href="/Departments"]');
        if (topNav) {
          currentDepartmentYearText = topNav.text().trim().toLocaleLowerCase();
        }
      } catch (e) {
        // do nothing
      }

      // we don't watch classes in summer
      if (currentDepartmentYearText.includes("summer")) {
        alert("We currently do not support notifications for summer classes, sorry");
        return;
      }
      try {
        let defaultValue = "";
        const localStorageEmailKey = "uscScheduleHelperEmail";
        const localStoragePhoneKey = "uscScheduleHelperPhone";
        try {
          defaultValue = localStorage.getItem(localStorageEmailKey) || "";
        } catch (e) {
          console.error(e);
        }
        const response = await Swal.fire({
          title: "Email",
          input: "email",
          type: "question",
          showCancelButton: true,
          inputValue: defaultValue,
        });

        if (!response || !response.value) {
          return;
        }
        let email = response.value.trim().toLowerCase();

        const suggested = await checkEmail(email);

        if (suggested) {
          const emailSuggestion = await Swal.fire({
            title: "Possible incorrect email",
            html: `The email you entered is ${email}.<br /> Did you mean <b>${suggested.full}</b>?`,
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: `Yes`,
            denyButtonText: `No (use my original email)`,
          });
          if (emailSuggestion.isConfirmed) {
            email = (suggested.full || "").trim().toLowerCase();
          }
          if (emailSuggestion.isDismissed) {
            return;
          }
        }
        try {
          localStorage.setItem(localStorageEmailKey, email);
        } catch (e) {
          console.error(e);
        }
        let defaultPhoneValue = "";

        try {
          defaultPhoneValue = localStorage.getItem(localStoragePhoneKey) || "";
        } catch (e) {
          console.error(e);
        }
        if (textsEnabled === undefined) {
          try {
            const data = await fetch("https://jonlu.ca/soc/texts-enabled", {
              method: "GET",
              headers: {
                accept: "application/json",
              },
            });
            const response = await data.json();
            textsEnabled = response.enabled;
          } catch (e) {
            console.error(e);
          }
        }
        let phone = "";
        if (textsEnabled) {
          const phoneResponse = await Swal.fire({
            title: "Phone number",
            cancelButtonText: `Skip`,
            html: `If you'd like texts in addition to emails, add your phone number here (costs $1 per section per semester) - optional. <input id="phone" placeholder="2135559020" value="${defaultPhoneValue}" class="swal2-input">`,
            preConfirm() {
              return new Promise((resolve) => {
                resolve($("#phone").val());
              });
            },
            onOpen() {
              $("#phone").focus();
            },
            showCancelButton: true,
          });
          phone = (phoneResponse && phoneResponse.value) || "";
          if (phone) {
            try {
              localStorage.setItem(localStoragePhoneKey, phone);
            } catch (e) {
              console.error(e);
            }
          }
        }
        // Try multiple ways of getting the department
        let department = $(form).find("#department").val();

        //If they got to this page by clicking on a specific course on myCourseBin, department won't be included in the
        // form, not sure why We do a hacky way by getting it from courseid
        if (!department) {
          let course = $(form).find("#courseid")[0];
          if (course) {
            course = $(course).attr("value");
            if (course) {
              course = course.split("-");
              department = course[0];
            }
          }
        }
        //Third way of getting the department, from above
        if (!department) {
          department = this.department;
        }

        if (department === "" || department === undefined) {
          errorModal(`Department in post request was null. Please contact jdecaro@usc.edu with a screenshot of this error!
Course: ${courseid}
Form: ${$(form).html()}
`);
          return;
        }

        sendPostRequest(email, courseid, fullCourseId, department, phone);
      } catch (e) {
        console.error(e);
      }
    });
  });
}

function sendPostRequest(email, courseid, fullCourseId, department, phone) {
  let semester = "";
  try {
    const termTab = document.getElementById("activeTermTab");
    if (termTab) {
      const [term, year] = termTab.textContent.trim().toLowerCase().split(" ");
      if (year && ["fall", "spring"].includes(term)) {
        semester = `${year}${term === "fall" ? "3" : "1"}`;
      }
    }
  } catch (e) {
    console.error(e);
  }
  $.ajax({
    method: "POST",
    url: "https://jonlu.ca/soc/notify",
    type: "json",
    data: {
      email,
      courseid,
      department,
      phone,
      id,
      semester,
      fullCourseId,
    },
    error(err) {
      console.log(err);
      if (err.status === 501) {
        errorModal("Error saving data! Please contact jdecaro@usc.edu with the class you are trying to register for.");
      } else if (err.status === 400) {
        const message = (err.responseJSON && err.responseJSON.error) || "Invalid email";
        errorModal(message);
      } else {
        errorModal(
          "An unknown error occurred! Please contact jdecaro@usc.edu with the class you are trying to register for.",
        );
      }
    },
    success(data, textStatus, { status }) {
      if (textStatus === "success") {
        let textNotif = `Email: <b>${data.email}</b><br>${data.phone && `Phone: <b>${data.phone}</b><br>`}<br>`;
        // server returns a 200 if they've never signed up/verified their email, and a 201 if they have. If they
        // haven't, show email verification notice
        if (status === 200) {
          textNotif +=
            "Sent verification email - please verify your email to begin receiving notifications! <br> \
                                            <strong> It's probably in your spam folder!</strong>";
        }

        const link = `<a href=venmo://paycharge?txn=pay&recipients=JonLuca&amount=1&note=${
          data.section && data.section.rand
        }>You can also copy and paste this link to auto open Venmo with the right fields.</a>`;

        if (data.isPaidAlready) {
          textNotif += `<br><br>You've already paid for this section! You'll receive notifications when a spot opens up. If you think this is in error, reach out to help@jonlu.ca`;
        } else {
          textNotif +=
            (data.phone &&
              textsEnabled &&
              `<br><br>To get text notifications, Venmo @JonLuca $1 with the following 8 numbers in the note section:<br><br><b style="font-size: 18px;">${
                data.section && data.section.rand
              }</b><br><br> <strong>Your venmo should look exactly like the image below, with nothing else. If it asks for a last 4 digits of the phone number, use 9020</strong><div id="venmo-image"><img src="${venmoImage}"/><img src="${venmoQrImage}"/><span class="randSectionId">${
                data.section && data.section.rand
              }</span><br>${link}</div>`) ||
            "";
        }

        textNotif +=
          '<br><br>If you have any questions, please reach out to <a href="mailto:jdecaro@usc.edu">jdecaro@usc.edu</a>';
        successModal(textNotif);
      }
      //They've been ratelimited
      if (status === 429) {
        errorModal(
          "You've been ratelimited! You are limited to 10 notifications in a 15 minute period. Please try again later",
        );
      }
    },
  });
}

//Helper function to show pretty error messages
function errorModal(message) {
  Swal.fire("Error!", message, "error");
}

//Helper function to show pretty success messages
function successModal(message) {
  Swal.fire("Success!", message, "success");
}

function parseWebReg() {
  //Because we insert a new column, we need to change the CSS around to make it look right
  changeCSSColumnWidth();
  //Iterate over every div. The layout of webreg is alternating divs for class name/code and then its content
  const classes = $(".accordion-content-area");
  //Parses each class found previously
  parseClass(classes);
  addPostRequests();
}
