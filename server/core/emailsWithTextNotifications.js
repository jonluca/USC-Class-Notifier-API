const emails = ["tranrl@usc.edu", "sarahyao@usc.edu", "anavbatr@usc.edu", "zack7siam@gmail.com", "zsiam@usc.edu", "gyashar@usc.edu", "sajeevsa@usc.edu", "javahera@usc.edu", "uyentuph@usc.edu", "mnmolaye@usc.edu"];

function emailHasPaid(email) {
  return emails.includes(email);
}

module.exports = emailHasPaid;
module.exports.emails = emails;