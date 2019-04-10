let emails = [
  "947730940@qq.com",
  "apalazuelosi@gmail.com",
  "danielgarcan98@gmail.com",
  "jordynwuzixin@gmail.com",
  "kaylabon@usc.edu",
  "klooney@usc.edu",
  "mariampe@usc.edu",
  "titizian@usc.edu",
  "yiqinshi@usc.edu",
  "yunsungy@usc.edu",
  "Mbbenjam@usc.edu",
  "jdmencha@usc.edu",
  "Benji.miller9104@gmail.com",
  "Hebish@usc.edu",
  "Angad20102010@gmail.com",
  "kristenkim98@gmail.com",
  "bdbrooks@usc.edu"
]

for (let i = 0; i < emails.length; i++) {
  emails[i] = emails[i].toLowerCase();
}

// Not used by SOCAPI, just helper functions for when I'm cleaning up the email list
let dedupe = new Set(emails);
let finalEmailList = Array.from(dedupe);
finalEmailList = finalEmailList.sort();

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
