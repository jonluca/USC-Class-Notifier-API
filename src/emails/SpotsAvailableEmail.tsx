import { Button, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import EmailBase from "./components/EmailBase";
import { baseDomain } from "@/constants";
import type { Course, Section as ClassSection } from "@/server/api/types.ts";

export interface SpotsAvailableEmailProps {
  email: string;
  key: string;
  sectionId: string;
  sectionEntry: ClassSection;
  course: Course;
  numberOfStudentsWatching: number;
}
const SpotsAvailableEmail = ({ course, sectionEntry, key, sectionId }: SpotsAvailableEmailProps) => {
  const spotsAvailable = sectionEntry.totalSeats - sectionEntry.registeredSeats;
  const className = course.name;
  const courseID =
    course.publishedCourseCode?.courseHyphen || course.scheduledCourseCode?.courseHyphen || course.fullCourseName;
  const section = sectionEntry.sisSectionId;
  const spotText = spotsAvailable === 1 ? "spot" : "spots";
  const previewText = `${spotsAvailable} ${spotText} available in ${courseID}`;
  return (
    <EmailBase previewText={previewText}>
      <Text className="text-black text-[24px] font-bold text-center p-0 mt-6 mx-0">{previewText}</Text>
      <Section className="mx-auto mt-6">
        <Row>
          <Text className="text-black text-[16px] px-2 m-0">
            You are receiving this email because you requested to be notified when spots opened up for {courseID},{" "}
            {className} - Section {section}.
          </Text>
        </Row>
        <Row>
          <Text className="text-black text-[16px] px-2 m-0 font-bold mt-2">
            You will not be notified again unless you click the button below.
          </Text>
        </Row>
      </Section>
      <Button
        className="bg-black rounded-xl text-white font-bold no-underline text-center py-2 w-full text-lg mt-4"
        href={`${baseDomain}/watch?key=${key}&section=${sectionId}`}
      >
        Continue receiving notifications
      </Button>
      <Button
        className="bg-neutral-700 rounded-xl text-white font-bold no-underline text-center py-2 w-full text-lg mt-4"
        href={`${baseDomain}/dashboard?key=${key}`}
      >
        View Dashboard
      </Button>
      <Button
        className="bg-violet-100 rounded-xl text-black font-bold no-underline text-center py-2 w-full text-lg mt-2"
        href={`${baseDomain}/faq?key=${key}`}
      >
        FAQ
      </Button>
    </EmailBase>
  );
};

SpotsAvailableEmail.PreviewProps = {
  email: "usc-schedule-helper@jonlu.ca",
  key: "asf",
  sectionId: "29908",
  numberOfStudentsWatching: 2,
  sectionEntry: {
    sisSectionId: "29908",
    linkCode: "A",
    linkCodeForSort: "A",
    rnrSessionId: 35662,
    peSectionId: 733723,
    courseId: 58931,
    hasDClearance: true,
    classType: null,
    name: null,
    notes: null,
    description: null,
    group: null,
    schedule: [
      {
        dayCode: "MW",
        days: ["Mon", "Wed"],
        startTime: "15:00",
        endTime: "15:50",
        location: "THH101",
        building: "THH",
        room: "101",
        sectionLocationSqNumber: 1,
        buildingRoom: "THH 101",
      },
    ],
    totalSeats: 115,
    registeredSeats: 89,
    waitlistedSeats: null,
    rnrMode: "Lecture",
    session: {
      termCode: "20261",
      rnrSessionCode: "001",
      description: null,
      rnrSessionId: 35662,
    },
    units: ["2.0"],
    instructors: [
      {
        firstName: "Mohammad Reza",
        lastName: "Rajati",
      },
    ],
    syllabus: "https://usc.simplesyllabus.com/en-US/syllabus/Spring 2026/CSCI/102/29908",
    isCancelled: false,
    isFull: false,
    rnrModeCode: "C",
    term: {
      value: 20261,
      year: 2026,
      term: 1,
      season: "Spring",
    },
    termCode: 20261,
    season: "Spring",
    year: 2026,
  },
  course: {
    courseId: 58931,
    startTermCode: 0,
    endTermCode: null,
    classNumber: "102",
    sequence: null,
    suffix: null,
    description: "Fundamental concepts of algorithmic thinking as a primer to programming. Introduction to C++.",
    fullCourseName: "CSCI 102",
    isCrossListed: false,
    maxUnits: null,
    courseNotes: null,
    termNotes: null,
    duplicateCredit: null,
    recommendedPrep: null,
    geCode: null,
    scheduledCourseCode: {
      prefix: "CSCI",
      number: "102",
      suffix: "",
      courseHyphen: "CSCI-102",
      courseSpace: "CSCI 102",
      courseSmashed: "CSCI102",
    },
    publishedCourseCode: {
      prefix: "CSCI",
      number: "102",
      suffix: "",
      courseHyphen: "CSCI-102",
      courseSpace: "CSCI 102",
      courseSmashed: "CSCI102",
    },
    matchedCourseCode: {
      prefix: "CSCI",
      number: "102",
      suffix: "",
      courseHyphen: "CSCI-102",
      courseSpace: "CSCI 102",
      courseSmashed: "CSCI102",
    },
    courseUnits: [2],
    sections: null,
    prerequisiteCourseCodes: null,
    corequisiteCourseCodes: null,
    courseRestrictions: [],
    majorRestrictions: null,
    schoolRestrictions: null,
    concurrentCourses: null,
    remainingSectionSeats: 230,
    sectionSeatCount: 230,
    termCode: 20261,
    prefix: "CSCI",
    name: "Introduction to Programming",
    sortOrder: 0,
  },
} satisfies SpotsAvailableEmailProps;

export default SpotsAvailableEmail;
