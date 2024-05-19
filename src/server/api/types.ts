export type DepartmentResponse = DepartmentInfo | { error: string };
export interface DepartmentInfo {
  schd_sync_dtm: Date;
  Dept_Info: DeptInfo;
  OfferedCourses: OfferedCourses;
}

export interface DeptInfo {
  department: string;
  abbreviation: Abbreviation;
  phone_number: string;
  address: string;
  email: TermNotes;
  url: string;
  ugrad_dclass_phone_number: string;
  ugrad_dclass_address: string;
  ugrad_dclass_email: TermNotes;
  ugrad_dclass_url: TermNotes;
  grad_dclass_phone_number: string;
  grad_dclass_address: string;
  grad_dclass_email: TermNotes;
  grad_dclass_url: TermNotes;
  Notes: string;
  TermNotes: TermNotes;
  dept_url: string;
}

export interface TermNotes {}

export enum Abbreviation {
  Ame = "AME",
  Csci = "CSCI",
  Dsci = "DSCI",
  Ee = "EE",
  Ise = "ISE",
  Itp = "ITP",
  Math = "MATH",
  Phys = "PHYS",
  Psyc = "PSYC",
}

export interface OfferedCourses {
  course: Course[] | Course;
}

export interface Course {
  IsCrossListed: IsCrossListed;
  PublishedCourseID: string | undefined;
  ScheduledCourseID: string;
  CourseData: CourseData;
}

export interface CourseData {
  prefix: Abbreviation;
  number: string;
  sequence: PrereqText;
  suffix: PrereqText;
  title: string;
  description: string;
  units: string;
  restriction_by_major: PrereqText;
  restriction_by_class: PrereqText;
  restriction_by_school: TermNotes;
  CourseNotes: TermNotes;
  CourseTermNotes: TermNotes;
  prereq_text: PrereqText;
  coreq_text: TermNotes;
  SectionData: SectionDataUnion;
}

export type SectionDataUnion = SectionDataClass[] | SectionDataClass;
export interface SectionDataClass {
  id: string;
  session: string;
  dclass_code: DclassCode;
  title: string;
  section_title: PrereqText;
  description: PrereqText;
  notes: PrereqText;
  type: Type;
  units: string;
  spaces_available: string;
  number_registered: string;
  wait_qty: string;
  canceled: IsCrossListed;
  blackboard: BlackboardUnion;
  day?: DayUnion;
  start_time?: string;
  end_time?: string;
  location?: string;
  instructor?: Instructor;
  syllabus: Syllabus;
  IsDistanceLearning: IsCrossListed;
}

export enum IsCrossListed {
  N = "N",
  Y = "Y",
}

export type BlackboardUnion = BlackboardClass | IsCrossListed;

export interface BlackboardClass {
  "0": The0;
}

export enum The0 {
  Empty = " ",
}

export type DayUnion = TermNotes | DayEnum;

export enum DayEnum {
  F = "F",
  H = "H",
  M = "M",
  Mw = "MW",
  Mwf = "MWF",
  S = "S",
  T = "T",
  Th = "TH",
  W = "W",
}

export enum DclassCode {
  D = "D",
  R = "R",
}

export type PrereqText = TermNotes | string;

export interface Instructor {
  last_name: string;
  first_name: string;
  bio_url?: string;
}

export interface Syllabus {
  format: FormatUnion;
  filesize: PrereqText;
}

export type FormatUnion = TermNotes | FormatEnum;

export enum FormatEnum {
  ApplicationPDF = "application/pdf",
}

export enum Type {
  Dis = "Dis",
  Lab = "Lab",
  Lec = "Lec",
  LecLab = "Lec-Lab",
  Qz = "Qz",
}

export type DepartmentUnion = DepartmentElement[] | DepartmentElement;

export interface DepartmentList {
  department: DepartmentUnion;
}

export interface DepartmentElement {
  code: string;
  name: string;
  type: Type;
  department?: DepartmentUnion;
}

export enum Type {
  C = "C",
  N = "N",
  Y = "Y",
}
