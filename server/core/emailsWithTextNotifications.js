const emails = ["tranrl@usc.edu", "sarahyao@usc.edu", "anavbatr@usc.edu", "zack7siam@gmail.com", "zsiam@usc.edu", "gyashar@usc.edu", "sajeevsa@usc.edu", "javahera@usc.edu", "uyentuph@usc.edu", "mnmolaye@usc.edu",
    "mart822@usc.edu", "julianamartinezb@gmail.com", "azanwar@usc.edu", "jwalrave@usc.edu", "xmzzn123@gmail.com", "tpohlman@usc.edu", "johnduga@usc.edu", "tienrate@usc.edu", "pudidz@gmail.com", "abauman@usc.edu",
    "sean@seangaul.com", "zoerberger@gmail.com", "caiyuliangbuzz@gmail.com", "sshipp@usc.edu", "amaripag@usc.edu", "adevgan@usc.edu", "woltersd@usc.edu", "millerbe@usc.edu", "janeth@usc.edu", "ndelman@usc.edu",
    "raywang@usc.edu", "gchrysta@usc.edu", "dhaddha@usc.edu", "jason2larue@gmail.com", "flawley@usc.edu", "ambhagat@usc.edu", "abhambha@usc.edu", "rpinckney5@gmail.com", "ntbasch@gmail.com", "graceeva@usc.edu", "hxian@usc.edu", "mitchepl@usc.edu"];

function emailHasPaid(email) {
    return emails.includes(email);
}

module.exports = emailHasPaid;
module.exports.emails = emails;