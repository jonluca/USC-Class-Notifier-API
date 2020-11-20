const students = require('../models/student');
const semester = require("../config/config").semester;

async function run() {
  const allStudents = await students.find({});
  for (const student of allStudents) {
    for (const section of student.sectionsWatching) {
      if (section.date > new Date('2019-10-01')) {
        section.semester = semester;
      } else {
        section.semester = "OLD";
      }
      section.rand = '-1';
      section.phone = student.phone;
    }
    student.semester = undefined;
    // delete student.semester;
    student.markModified('sectionsWatching');
    student.markModified('semester');
    student.set('semester', undefined, {strict: false});
    await student.save(function (err) {
      if (err) {
        console.log(err);
      }
    });
  }
}

run().then(() => {
  console.log('done');
});