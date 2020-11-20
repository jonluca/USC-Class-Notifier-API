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
            this.addSectionDetails(section, course);
          }
        } else {
          this.addSectionDetails(sectionData, course);
        }
      }
    }
  }

  getSection(sectionNumber) {
    if (this.sections.hasOwnProperty(sectionNumber)) {
      return this.sections[sectionNumber];
    }
  }

  addSectionDetails(section, course) {
    this.sections[section.id] = {};
    const total_spots = section.spaces_available;
    const registered = section.number_registered;
    this.sections[section.id].available = parseInt(total_spots) - parseInt(registered);
    this.sections[section.id].courseID = course.PublishedCourseID;
    this.sections[section.id].courseName = course.CourseData.title;
    this.sections[section.id].sectionNumber = section.id;
    // For GEs and GSEMs, they woun't have courseID in th emain object because it's from a bunch of different departments
    if (typeof (this.sections[section.id].courseID) != "string") {
      this.sections[section.id].courseID = course.CourseData.prefix + "-" + course.CourseData.number;
    }
  }
}

module.exports = ClassController;