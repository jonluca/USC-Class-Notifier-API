let emails = [
  "akamali@usc.edu",
  "alexandraashoori@gmail.com",
  "amyj@usc.edu",
  "apallare@usc.edu",
  "belyaeva@usc.edu",
  "bullen@usc.edu",
  "bziemins@usc.edu",
  "chan025@usc.edu",
  "dgarciac@usc.edu",
  "dolgonkr@usc.edu",
  "eberge@usc.edu",
  "eckroate@usc.edu",
  "epaige@usc.edu",
  "flawey@usc.edu",
  "gjacobson98@gmail.com",
  "gmatamor@usc.edu",
  "haozeli@usc.edu",
  "hyungsik@usc.edu",
  "jakeob29@icloud.com",
  "josuerod@usc.edu",
  "jroesler@usc.edu",
  "juliawad@usc.edu",
  "kinickx090@outlook.com",
  "kucap@usc.edu",
  "lapanoss@usc.edu",
  "lee619@usc.edu",
  "lingxigu@usc.edu",
  "lsharrin@usc.edu",
  "mariampe@usc.edu",
  "mch@usc.edu",
  "morganmi@usc.edu",
  "nohs@usc.edu",
  "oentoro@usc.edu",
  "oze@usc.edu",
  "rast@usc.edu",
  "rrbhatia@usc.edu",
  "sarahyao@usc.edu",
  "seherran@usc.edu",
  "snmontan@usc.edu",
  "szaboa@usc.edu",
  "tkwinter@usc.edu",
  "tramanhvu06@gmail.com",
  "vatsalgu@usc.edu",
  "vwestmor@usc.edu",
  "wang851@usc.edu",
  "wautters@usc.edu",
  "witwer@usc.edu",
  "woltersd@usc.edu",
  "yennapu@usc.edu",
  "yiqinshi@usc.edu",
  "youchenysc@gmail.com",
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
