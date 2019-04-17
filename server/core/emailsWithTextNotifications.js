let emails = [ '947730940@qq.com',
  'adamegyed@gmail.com',
  'akyle@usc.edu',
  'andrezmu@usc.edu',
  'aneetgrewal98@gmail.com',
  'angad20102010@gmail.com',
  'anushkaj@usc.edu',
  'apalazuelosi@gmail.com',
  'asunderw@usc.edu',
  'aujk@usc.edu',
  'balasky@usc.edu',
  'bartecki@usc.edu',
  'bdbrooks@usc.edu',
  'benji.miller9104@gmail.com',
  'bposnock@usc.edu',
  'carsonjamesmarsh@gmail.com',
  'cathleey@usc.edu',
  'chen155@usc.edu',
  'chjameso@usc.edu',
  'cullenpo@usc.edu',
  'danielgarcan98@gmail.com',
  'derickmanoukian@gmail.com',
  'dmvaughn@usc.edu',
  'doyloo@usc.edu',
  'eisnerl@usc.edu',
  'erherrear@usc.edu',
  'flawley@usc.edu',
  'gagneeld@usc.edu',
  'grava@usc.edu',
  'gtking@usc.edu',
  'hebish@usc.edu',
  'inasrall@usc.edu',
  'jackienichols@me.com',
  'jainamkj@usc.edu',
  'jdmencha@usc.edu',
  'jghoy19@gmail.com',
  'jhburges@usc.edu',
  'jordynwuzixin@gmail.com',
  'kamrynmc@usc.edu',
  'kathygon@usc.edu',
  'kaylabon@usc.edu',
  'klooney@usc.edu',
  'kristenk@usc.edu',
  'kristenkim98@gmail.com',
  'kuehler@usc.edu',
  'kyleapet@usc.edu',
  'lapanoss@usc.edu',
  'laurenhan20@gmail.com',
  'lcarrera@usc.edu',
  'mariampe@usc.edu',
  'marknish@usc.edu',
  'martinyo@usc.edu',
  'mbbenjam@usc.edu',
  'mikaelalw@gmail.com',
  'morrisej@usc.edu',
  'nfarr@usc.edu',
  'oentoro@usc.edu',
  'paul13099650@gmail.com',
  'pohoomul@usc.edu',
  'salinaca@usc.edu',
  'sam.ross@live.com',
  'slouis@usc.edu',
  'smcginn@usc.edu',
  'steupert@usc.edu',
  'suerovig@usc.edu',
  'sulzer@usc.edu',
  'titizian@usc.edu',
  'will.s.ducharme@gmail.com',
  'yanzhouw@usc.edu',
  'yiqinshi@usc.edu',
  'yunsungy@usc.edu',
  'zapolski@usc.edu',
  'zhuojunc@usc.edu',
  'zhuyue@usc.edu',
  'dtaras1124@gmail.com',
  'Parkshin@usc.edu',
  'Bmasjedi@usc.edu',
  'biermann@usc.edu'
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
