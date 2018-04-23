const emails = ["tranrl@usc.edu", "sarahyao@usc.edu", "anavbatr@usc.edu", "zack7siam@gmail.com", "zsiam@usc.edu", "gyashar@usc.edu", "sajeevsa@usc.edu", "javahera@usc.edu", "uyentuph@usc.edu", "mnmolaye@usc.edu",
    "mart822@usc.edu", "julianamartinezb@gmail.com", "azanwar@usc.edu", "jwalrave@usc.edu", "xmzzn123@gmail.com", "tpohlman@usc.edu", "johnduga@usc.edu", "tienrate@usc.edu", "pudidz@gmail.com", "abauman@usc.edu",
    "sean@seangaul.com", "zoerberger@gmail.com", "caiyuliangbuzz@gmail.com", "sshipp@usc.edu", "amaripag@usc.edu", "adevgan@usc.edu", "woltersd@usc.edu", "millerbe@usc.edu", "janeth@usc.edu", "ndelman@usc.edu",
    "raywang@usc.edu", "gchrysta@usc.edu", "dhaddha@usc.edu", "jason2larue@gmail.com", "flawley@usc.edu", "ambhagat@usc.edu", "abhambha@usc.edu", "rpinckney5@gmail.com", "ntbasch@gmail.com", "graceeva@usc.edu",
    "hxian@usc.edu", "mitchepl@usc.edu", "bryceste@usc.edu", "chanlee@usc.edu", "daniel@devereaux.cz", "eleblanc@usc.edu", "jpelliot@usc.edu", "zhan464@usc.edu", "nredfern@usc.edu", "chjameso@usc.edu", "swoap@usc.edu"
    , "yock@usc.edu", "tribbitt@usc.edu", "jinjiach@usc.edu", "mr.hakimian@gmail.com", "jamiedriscoll11@gmail.com", "jinchenz@usc.edu", "joyceali@usc.edu", "aamarnat@usc.edu", "danckert@usc.edu", "ghstenge@usc.edu",
    "grava@usc.edu", "markosky@usc.edu", "ursitti@usc.edu", "danckert@usc.edu", "aaronesm@usc.edu", "djsoroud@usc.edu", "jlsharpe@usc.edu", "marknish@usc.edu", "baldwinm@usc.edu", "tudahl@usc.edu", "alyssay@usc.edu",
    "jacksock@usc.edu", "pwakelan@usc.edu", "smcginn@usc.edu", "cblamber@usc.edu", "gsmcmaho@usc.edu", "szabojoh@usc.edu", "steupert@usc.edu", "masonwis@usc.edu", "gazola@usc.edu", "sarakell@usc.edu", "zhangjij@usc.edu",
    "jackienichols@me.com", "borgida@usc.edu", "arguevar@usc.edu", "maansima@usc.edu", "opereira@usc.edu", "rccampbe@usc.edu", "abelyaeva98@gmail.com", "bposnock@usc.edu", "ayeshoua@usc.edu"];

function emailHasPaid(email) {
    return emails.includes(email);
}

module.exports = emailHasPaid;
module.exports.emails = emails;