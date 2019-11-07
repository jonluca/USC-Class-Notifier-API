let emails = [
  "akamali@usc.edu",
  "alexandraashoori@gmail.com",
  "amyj@usc.edu",
  "apallare@usc.edu",
  "apbarron@usc.edu",
  "bartecki@usc.edu",
  "belyaeva@usc.edu",
  "bullen@usc.edu",
  "bziemins@usc.edu",
  "castancj@usc.edu",
  "chan025@usc.edu",
  "csheetz@usc.edu",
  "dgarciac@usc.edu",
  "dmanouki@usc.edu",
  "dmvaughn@usc.edu",
  "dolgonkr@usc.edu",
  "eberge@usc.edu",
  "eckroate@usc.edu",
  "epaige@usc.edu",
  "flawey@usc.edu",
  "francescafaugno@yahoo.com",
  "gjacobson98@gmail.com",
  "gmatamor@usc.edu",
  "grava@usc.edu",
  "greerber@usc.edu",
  "guraseeb@usc.edu",
  "haddan@usc.edu",
  "haozeli@usc.edu",
  "cdlarsen@usc.edu",
  "hyungsik@usc.edu",
  "jacksogh@usc.edu",
  "jakeob29@icloud.com",
  "jhburges@usc.edu",
  "josuerod@usc.edu",
  "joyceali@usc.edu",
  "jroesler@usc.edu",
  "juliawad@usc.edu",
  "jvanderc@usc.edu",
  "kalturki@usc.edu",
  "kelleyng@usc.edu",
  "kimhan@usc.edu",
  "kinickx090@outlook.com",
  "kucap@usc.edu",
  "lapanoss@usc.edu",
  "lee619@usc.edu",
  "lfaltins@usc.edu",
  "lianwang@usc.edu",
  "lingxigu@usc.edu",
  "lsharrin@usc.edu",
  "ltermart@usc.edu",
  "mariampe@usc.edu",
  "mashabbi@usc.edu",
  "mch@usc.edu",
  "morganmi@usc.edu",
  "nickchen@usc.edu",
  "nneven@usc.edu",
  "nohs@usc.edu",
  "ntidow988@gmail.com",
  "oentoro@usc.edu",
  "orford@usc.edu",
  "oze@usc.edu",
  "pdmoreno@usc.edu",
  "piercech@usc.edu",
  "rast@usc.edu",
  "rossc@usc.edu",
  "rossmeis@usc.edu",
  "royak@usc.edu",
  "rrbhatia@usc.edu",
  "ruezga@usc.edu",
  "sarahyao@usc.edu",
  "scheg@usc.edu",
  "seherran@usc.edu",
  "snmontan@usc.edu",
  "stara@usc.edu",
  "szaboa@usc.edu",
  "thorii@usc.edu",
  "tkwinter@usc.edu",
  "tpohlman@usc.edu",
  "tramanhvu06@gmail.com",
  "vatsalgu@usc.edu",
  "vwestmor@usc.edu",
  "wang851@usc.edu",
  "wautters@usc.edu",
  "witwer@usc.edu",
  "woltersd@usc.edu",
  "xiaochey@usc.edu",
  "xinyaomi@usc.edu",
  "yangcynt@usc.edu",
  "yennapu@usc.edu",
  "yiqinshi@usc.edu",
  "youchenysc@gmail.com",
  "yucather@usc.edu",
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
