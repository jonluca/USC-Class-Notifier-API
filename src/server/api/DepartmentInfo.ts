import type { Course, DepartmentInfo, Instructor, SectionDataClass } from "@/server/api/types";

export interface SectionEntry {
  available: number;
  courseID: string;
  courseName: string;
  sectionNumber: string;
  type: string | undefined;
  units: string | undefined;
  prefix: string | undefined;
  day: string | undefined;
  session: string | undefined;
  location: string | undefined;
  instructor?: Instructor | string;
  isDistanceLearning: boolean;
}
export class Department {
  courseData: Course[];
  sections: Record<string, SectionEntry> = {};

  constructor(data: DepartmentInfo) {
    if (data && data.OfferedCourses && data.OfferedCourses.course) {
      const courseData = data.OfferedCourses.course;
      this.courseData = Array.isArray(courseData) ? courseData : [courseData];
      this.sections = {};
      for (const course of this.courseData) {
        const sectionData = course.CourseData.SectionData;
        if (Array.isArray(sectionData)) {
          for (const section of sectionData) {
            this.addSectionDetails(section, course);
          }
        } else {
          this.addSectionDetails(sectionData, course);
        }
      }
    } else {
      this.courseData = [];
      this.sections = {};
    }
  }

  getSection(sectionNumber: string): SectionEntry | undefined {
    return this.sections[sectionNumber];
  }

  getSectionNumbersWithAvailability(): string[] {
    return Object.keys(this.sections).filter((sectionNumber) => this.sections[sectionNumber].available > 0);
  }
  getSectionNumbers(): string[] {
    return Object.keys(this.sections);
  }

  addSectionDetails(section: SectionDataClass, course: Course) {
    const total_spots = section.spaces_available;
    const registered = section.number_registered;
    const courseId =
      typeof course.PublishedCourseID !== "string"
        ? // For GEs and GSEMs, they won't have courseID in the main object because it's from a bunch of different departments
          course.CourseData.prefix + "-" + course.CourseData.number
        : course.PublishedCourseID;
    this.sections[section.id] = {
      available: parseInt(total_spots) - parseInt(registered),
      courseID: courseId,
      courseName: course.CourseData.title,
      sectionNumber: section.id,
      instructor: section.instructor,
      isDistanceLearning: section.IsDistanceLearning !== "N" || !section.IsDistanceLearning,
      type: addIfString(section.type),
      units: addIfString(section.units),
      location: addIfString(section.location),
      session: addIfString(section.session),
      day: addIfString(section.day),
      prefix: course.CourseData.prefix,
    };
  }
}
const addIfString = (object: unknown): string | undefined => {
  return typeof object === "string" ? object : undefined;
};
