let emails = [
  "apallare@usc.edu",
  "belyaeva@usc.edu",
  "eckroate@usc.edu",
  "josuerod@usc.edu",
  "jroesler@usc.edu",
  "juliawad@usc.edu",
  "kinickx090@outlook.com",
  "lsharrin@usc.edu",
  "mariampe@usc.edu",
  "snmontan@usc.edu",
  "tramanhvu06@gmail.com",
  "vatsalgu@usc.edu",
  "vwestmor@usc.edu",
  "wang851@usc.edu",
  "wautters@usc.edu",
  "woltersd@usc.edu",
  "yiqinshi@usc.edu",
  "zhenjial@usc.edu",
  "zixinwu@usc.edu"
]

for (let i = 0; i < emails.length; i++) {
  emails[i] = emails[i].toLowerCase();
  emails[i] = emails[i].trim();
}

// Not used by SOCAPI, just helper functions for when I'm cleaning up the email list
let dedupe = new Set(emails);
let finalEmailList = Array.from(dedupe);
finalEmailList = finalEmailList.sort();
console.log(finalEmailList)

function emailHasPaid(email) {
  if (!email) {
    return false;
  }
  email = email.toLowerCase();
  email = email.trim();
  return emails.includes(email);
}

module.exports = emailHasPaid;
module.exports.emails = emails;
