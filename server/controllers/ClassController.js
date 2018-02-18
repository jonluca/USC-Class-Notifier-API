class ClassController {
  constructor(data) {
    if (data && data.OfferedCourses && data.OfferedCourses.course) {
      this.courseData = data.OfferedCourses.course;

      /*Population section data*/
      this.sections = {};

      for (const course of this.courseData) {
        let sectionData = course.CourseData.SectionData;

        /*
        * The USC API either returns an array of sections OR an object, if it's only a single section
        * ...
        *
        * I know.
        *
        * */

        if (Array.isArray(sectionData)) {
          for (const section of sectionData) {
            this.sections[section.id] = section;
          }
        } else {
          this.sections[sectionData.id] = sectionData;
        }
      }

    }
  }

  getSection(sectionNumber) {
    return this.sections[sectionNumber];
  }

}

module.exports = ClassController;