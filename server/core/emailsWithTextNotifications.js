let emails = [
  "947730940@qq.com",
  "akyle@usc.edu",
  "aneetgrewal98@gmail.com",
  "angad20102010@gmail.com",
  "apalazuelosi@gmail.com",
  "aujk@usc.edu",
  "bdbrooks@usc.edu",
  "benji.miller9104@gmail.com",
  "bposnock@usc.edu",
  "chen155@usc.edu",
  "cullenpo@usc.edu",
  "danielgarcan98@gmail.com",
  "eisnerl@usc.edu",
  "erherrer@usc.edu",
  "hebish@usc.edu",
  "jdmencha@usc.edu",
  "jhburges@usc.edu",
  "jordynwuzixin@gmail.com",
  "kamrynmc@usc.edu",
  "kaylabon@usc.edu",
  "klooney@usc.edu",
  "kristenkim98@gmail.com",
  "lapanoss@usc.edu",
  "lcarrera@usc.edu",
  "mariampe@usc.edu",
  "martinyo@usc.edu",
  "mbbenjam@usc.edu",
  "oentoro@usc.edu",
  "sam.ross@live.com",
  "steupert@usc.edu",
  "titizian@usc.edu",
  "will.s.ducharme@gmail.com",
  "yiqinshi@usc.edu",
  "yunsungy@usc.edu",
  "Anushkaj@usc.edu",
  "doyloo@usc.edu",
  "Mikaelalw@gmail.com",
  "yanzhouw@usc.edu",
  "zapolski@usc.edu"
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
