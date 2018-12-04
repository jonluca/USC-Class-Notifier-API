let emails = [
  "10penagos10@gmail.com",
  "Aaronsgl@usc.edu",
  "abou@usc.edu",
  "abudpich@usc.edu",
  "amandarm@usc.edu",
  "ambhagat@usc.edu",
  "anavbatr@usc.edu",
  "angelflo@usc.edu",
  "anson21342006@gmail.com",
  "apalazuelosi@gmail.com",
  "arlamb@usc.edu",
  "asamad@usc.edu",
  "bartecki@usc.edu",
  "bryanhsu@usc.edu",
  "carsonjw@usc.edu",
  "carsonward43@yahoo.com",
  "molld@usc.edu",
  "cegunawa@usc.edu",
  "cfitzpat@usc.edu",
  "chen155@usc.edu",
  "chjameso@usc.edu",
  "choraria@usc.edu",
  "christopherr2929@gmail.com",
  "codypham@usc.edu",
  "cometbackwards@gmail.com",
  "connorchapkis1@gmail.com",
  "cruzh@usc.edu",
  "danckert@usc.edu ",
  "darrenhs@usc.edu",
  "derreckmacarthur@gmail.com",
  "emersonr@usc.edu",
  "evanliu@usc.edu",
  "gomezve@usc.edu",
  "gtking@usc.edu",
  "guraseeb@usc.edu",
  "hadavi@usc.edu",
  "haldeman@usc.edu",
  "holtmann@usc.edu",
  "hopiegould@gmail.com",
  "ieide@usc.edu",
  "jainamkj@usc.edu",
  "jamiedriscoll11@gmail.com",
  "jasorian@usc.edu",
  "javiergo@usc.edu",
  "jayasurs@usc.edu",
  "jmshephe@usc.edu",
  "johnpauv@usc.edu",
  "jonathanmenyhart@yahoo.com",
  "jratner@usc.edu",
  "jshalloe@usc.edu",
  "julietbe@usc.edu",
  "kecysun@usc.edu",
  "kreidpac@gmail.com",
  "lcdaniel@usc.edu",
  "lope649@usc.edu",
  "lrtorres@usc.edu",
  "lsteruya@usc.edu",
  "mariampet@gmail.com",
  "martin.yoo@usc.edu",
  "mattela@usc.edu",
  "menyhart@usc.edu ",
  "mhowes@usc.edu",
  "millermt@usc.edu",
  "miranda.hutchinson@yahoo.com",
  "momark99@gmail.com",
  "monger@usc.edu",
  "morrisej@usc.edu",
  "myrtue@usc.edu",
  "nabelian@usc.edu",
  "nedafarr99@gmail.com",
  "ngozini@gmail.com",
  "opereira@usc.edu",
  "pschumac@usc.edu",
  "qingyuca@usc.edu",
  "rinholm@usc.edu",
  "rselden@usc.edu",
  "ruixuelu@usc.edu",
  "sagigat@usc.edu",
  "samantph@usc.edu",
  "sbasse@usc.edu",
  "scottkunihiro9@gmail.com",
  "selawang@usc.edu",
  "siwani@usc.edu",
  "smcginn@usc.edu",
  "smithnm@usc.edu",
  "srashid@usc.edu",
  "ssitu@usc.edu",
  "stripp@usc.edu",
  "tbarrick@usc.edu",
  "tripkos@usc.edu",
  "uberstin@usc.edu",
  "ursitti@usc.edu",
  "valxing@gmail.com",
  "vomacka@usc.edu",
  "warasila@usc.edu",
  "whangb@usc.edu",
  "wingchin@usc.edu",
  "woltersd@usc.edu",
  "yinyiho@usc.edu",
  "yoonjung@usc.edu",
  "zberg@usc.edu",
  "zeb.berg12@gmail.com",
  "zrfisher@usc.edu"
]
for(let i = 0; i<emails.length; i++){
  emails[i] = emails[i].toLowerCase();
}
function emailHasPaid(email) {
  if(!email){
    return false;
  }
  email = email.toLowerCase();
  return emails.includes(email);
}

module.exports = emailHasPaid;
module.exports.emails = emails;