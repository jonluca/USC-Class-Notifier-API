const students = require("../models/student");
const { getSemester } = require("../utils/semester");

async function run() {
  const allStudents = await students.find({});
  for (const student of allStudents) {
    let newSectionsWatching = [];
    for (const section of student.sectionsWatching) {
      if (section.date > new Date("2020-10-01")) {
        section.semester = getSemester();
        newSectionsWatching.push(section);
      }
    }
    student.sectionsWatching = newSectionsWatching;
    // delete student.semester;
    student.markModified("sectionsWatching");
    await student.save(function (err) {
      if (err) {
        console.log(err);
      }
    });
  }
}

run().then(() => {
  console.log("done");
});
