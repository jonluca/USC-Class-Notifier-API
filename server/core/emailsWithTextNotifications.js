let emails = [
  "947730940@qq.com",
  "akyle@usc.edu",
  "aneetgrewal98@gmail.com",
  "angad20102010@gmail.com",
  "anushkaj@usc.edu",
  "apalazuelosi@gmail.com",
  "aujk@usc.edu",
  "bdbrooks@usc.edu",
  "benji.miller9104@gmail.com",
  "bposnock@usc.edu",
  "cathleey@usc.edu",
  "chen155@usc.edu",
  "cullenpo@usc.edu",
  "danielgarcan98@gmail.com",
  "dmvaughn@usc.edu",
  "doyloo@usc.edu",
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
  "laurenhan20@gmail.com",
  "lcarrera@usc.edu",
  "mariampe@usc.edu",
  "martinyo@usc.edu",
  "mbbenjam@usc.edu",
  "mikaelalw@gmail.com",
  "oentoro@usc.edu",
  "pohoomul@usc.edu",
  "sam.ross@live.com",
  "smcginn@usc.edu",
  "steupert@usc.edu",
  "sulzer@usc.edu",
  "titizian@usc.edu",
  "will.s.ducharme@gmail.com",
  "yanzhouw@usc.edu",
  "yiqinshi@usc.edu",
  "yunsungy@usc.edu",
  "zapolski@usc.edu",
  "Kristenk@usc.edu",
  "zhuojunc@usc.edu",
  "Asunderw@usc.edu"
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
