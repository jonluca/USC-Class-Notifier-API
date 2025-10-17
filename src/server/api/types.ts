export interface CoursesResponse {
  termCode: number;
  courseCount: number;
  searchQuery: null;
  courses: Course[];
  programs: null;
}

export interface Course {
  courseId: number;
  startTermCode: number;
  endTermCode: null;
  classNumber: string | null;
  sequence: string | null;
  suffix: string | null;
  description: string | null;
  fullCourseName: string | null;
  isCrossListed: boolean;
  maxUnits: number | null;
  courseNotes: string | null;
  termNotes: string | null;
  duplicateCredit: null;
  recommendedPrep: null;
  geCode: null;
  scheduledCourseCode: EdCourseCode | null;
  publishedCourseCode: EdCourseCode | null;
  matchedCourseCode: EdCourseCode | null;
  courseUnits: number[];
  sections: null | Section[];
  prerequisiteCourseCodes: null;
  corequisiteCourseCodes: null;
  courseRestrictions: CourseRestriction[];
  majorRestrictions: null;
  schoolRestrictions: null;
  concurrentCourses: null;
  remainingSectionSeats: number;
  sectionSeatCount: number;
  termCode: number;
  prefix: string;
  name: string;
  sortOrder: number;
}

export interface EdCourseCode {
  prefix: string;
  number: string;
  suffix: string;
  courseHyphen: string;
  courseSpace: string;
  courseSmashed: string;
}

export interface CourseRestriction {
  groupCode: string;
  groupDescription: string;
  restrictionCode: string;
  restriction: string;
}
export interface Instructor {
  firstName: string;
  lastName: string;
}
export interface Section {
  sisSectionId: string;
  linkCode: string | null;
  linkCodeForSort: string | null;
  rnrSessionId: number;
  peSectionId: number;
  courseId: number;
  hasDClearance: boolean;
  classType: null;
  name: null;
  notes: null;
  description: null;
  group: null;
  schedule: Schedule[];
  totalSeats: number;
  registeredSeats: number;
  waitlistedSeats: null;
  rnrMode: string;
  session: Session;
  units: string[];
  instructors: Instructor[];
  syllabus: string;
  isCancelled: boolean;
  isFull: boolean;
  rnrModeCode: string;
  term: Term;
  termCode: number;
  season: string;
  year: number;
}

export interface Schedule {
  dayCode: null | string;
  days: string[];
  startTime: string;
  endTime: string;
  location: string;
  building: string;
  room: string;
  sectionLocationSqNumber: number;
  buildingRoom: string;
}

export interface Session {
  termCode: string;
  rnrSessionCode: string;
  description: null;
  rnrSessionId: number;
}

export interface Term {
  value: number;
  year: number;
  term: number;
  season: string;
}
