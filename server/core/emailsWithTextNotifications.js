let emails = [
  "vwestmor@usc.edu",
  "apallare@usc.edu",
  "Wautters@usc.edu",
  "Snmontan@usc.edu",
  "eckroate@usc.edu",
  "lsharrin@usc.edu",
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
