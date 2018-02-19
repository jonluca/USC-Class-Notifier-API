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
            this.addSectionDetails(section);
            this.sections[section.id].courseID = course.PublishedCourseID;
            this.sections[section.id].courseName = course.CourseData.title;
          }
        } else {
          this.addSectionDetails(sectionData);
        }
      }

    }
  }

  getSection(sectionNumber) {
    if (this.sections.hasOwnProperty(sectionNumber)) {
      return this.sections[sectionNumber];
    }
  }

  addSectionDetails(section) {
    this.sections[section.id] = {};
    const total_spots = section.spaces_available;
    const registered = section.number_registered;
    const available = parseInt(total_spots) - parseInt(registered);
    this.sections[section.id].available = available;
  }
}

module.exports = ClassController;