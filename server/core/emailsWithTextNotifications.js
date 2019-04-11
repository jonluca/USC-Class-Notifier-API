let emails = [
  "947730940@qq.com",
  "angad20102010@gmail.com",
  "apalazuelosi@gmail.com",
  "bdbrooks@usc.edu",
  "benji.miller9104@gmail.com",
  "danielgarcan98@gmail.com",
  "hebish@usc.edu",
  "jdmencha@usc.edu",
  "jordynwuzixin@gmail.com",
  "kaylabon@usc.edu",
  "klooney@usc.edu",
  "kristenkim98@gmail.com",
  "mariampe@usc.edu",
  "mbbenjam@usc.edu",
  "titizian@usc.edu",
  "yiqinshi@usc.edu",
  "yunsungy@usc.edu",
  "aneetgrewal98@gmail.com",
  "Sam.ross@live.com",
  "Kamrynmc@usc.edu",
  "martinyo@usc.edu",
  "aujk@usc.edu",
  "akyle@usc.edu",
  "chen155@usc.edu",
  "lcarrera@usc.edu",
  "jhburges@usc.edu",
  "bposnock@usc.edu",
  "Steupert@usc.edu",
  "cullenpo@usc.edu"
]

for (let i = 0; i < emails.length; i++) {
  emails[i] = emails[i].toLowerCase();
  emails[i] = emails[i].trim();
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
