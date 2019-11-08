let emails = [
  "abrisach@usc.edu",
  "acritten@usc.edu",
  "akamali@usc.edu",
  "alexandraashoori@gmail.com",
  "alexcooper0608@gmail.com",
  "alrxandraashoori@gmail.com",
  "amyj@usc.edu",
  "apallare@usc.edu",
  "apbarron@usc.edu",
  "ariannbl@usc.edu",
  "assraf@usc.edu",
  "azangril@usc.edu",
  "bartecki@usc.edu",
  "bdeneaul@usc.edu",
  "belyaeva@usc.edu",
  "bullen@usc.edu",
  "bziemins@usc.edu",
  "castancj@usc.edu",
  "cdlarsen@usc.edu",
  "chan025@usc.edu",
  "chaniota@usc.edu",
  "chansonz@usc.edu",
  "csheetz@usc.edu",
  "ddole@usc.edu",
  "dgarciac@usc.edu",
  "dmanouki@usc.edu",
  "dmvaughn@usc.edu",
  "dolgonkr@usc.edu",
  "eberge@usc.edu",
  "eckroate@usc.edu",
  "egyed@usc.edu",
  "epaige@usc.edu",
  "flawey@usc.edu",
  "francescafaugno@yahoo.com",
  "friday games",
  "gbufalin@usc.edu",
  "gjacobson98@gmail.com",
  "glapid@usc.edu",
  "gmatamor@usc.edu",
  "grava@usc.edu",
  "greerber@usc.edu",
  "guraseeb@usc.edu",
  "haddan@usc.edu",
  "haozeli@usc.edu",
  "hcheves@usc.edu",
  "huich@usc.edu",
  "hyungsik@usc.edu",
  "jacksogh@usc.edu",
  "jakeob29@icloud.com",
  "jenniferveronicahewlett@gmail.com",
  "jhburges@usc.edu",
  "jmkaplan@usc.edu",
  "josuerod@usc.edu",
  "joyceali@usc.edu",
  "jroesler@usc.edu",
  "jtnishid@usc.edu",
  "juliawad@usc.edu",
  "jvanderc@usc.edu",
  "kaileehi@usc.edu",
  "kalturki@usc.edu",
  "kelleyng@usc.edu",
  "kimhan@usc.edu",
  "kinickx090@outlook.com",
  "kkov@usc.edu",
  "koutoumb@usc.edu",
  "kucap@usc.edu",
  "lapanoss@usc.edu",
  "lee619@usc.edu",
  "lee792@usc.edu",
  "lfaltins@usc.edu",
  "lianwang@usc.edu",
  "lingxigu@usc.edu",
  "louderba@usc.edu",
  "lsharrin@usc.edu",
  "ltermart@usc.edu",
  "madisodg@usc.edu",
  "mariampe@usc.edu",
  "mashabbi@usc.edu",
  "maxfried@usc.edu",
  "mch@usc.edu",
  "morganmi@usc.edu",
  "mulryt@usc.edu",
  "nabadi@usc.edu",
  "nickchen@usc.edu",
  "nneven@usc.edu",
  "nohs@usc.edu",
  "ntidow988@gmail.com",
  "oentoro@usc.edu",
  "opereira@usc.edu",
  "orford@usc.edu",
  "oze@usc.edu",
  "pdmoreno@usc.edu",
  "piercech@usc.edu",
  "rast@usc.edu",
  "rossc@usc.edu",
  "rossmeis@usc.edu",
  "royak@usc.edu",
  "rrbhatia@usc.edu",
  "rrjung@usc.edu",
  "ruezga@usc.edu",
  "rutama@usc.edu",
  "sarahyao@usc.edu",
  "sarahyao@usc@edu",
  "scheg@usc.edu",
  "seherran@usc.edu",
  "shculver@usc.edu",
  "sheridah@usc.edu",
  "snmontan@usc.edu",
  "stara@usc.edu",
  "szaboa@usc.edu",
  "thorii@usc.edu",
  "tips and ubers",
  "tkwinter@usc.edu",
  "tpohlman@usc.edu",
  "tramanhvu06@gmail.com",
  "vatsalgu@usc.edu",
  "vwestmor@usc.edu",
  "wang851@usc.edu",
  "wautters@usc.edu",
  "will454@usc.edu",
  "witwer@usc.edu",
  "woltersd@usc.edu",
  "xiaochey@usc.edu",
  "xinyaomi@usc.edu",
  "yangcynt@usc.edu",
  "yennapu@usc.edu",
  "yiqinshi@usc.edu",
  "youchenysc@gmail.com",
  "yuandonx@usc.edu",
  "yucather@usc.edu",
  "zhenjial@usc.edu",
  "zixinwu@usc.edu",
  "zqaderi@usc.edu"
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
