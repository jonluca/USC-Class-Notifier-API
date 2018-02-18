class ClassController {
  constructor(data) {
    if (data && data.OfferedCourses && data.OfferedCourses.course) {
      this.courseData = data.OfferedCourses.course;
    }
  }

  getSection(sectionNumber) {
    for (const course of this.courseData) {

    }
  }

}

module.exports = ClassController;