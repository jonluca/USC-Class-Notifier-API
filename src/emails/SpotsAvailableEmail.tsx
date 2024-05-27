import { Button, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import EmailBase from "./components/EmailBase";
import { baseDomain } from "@/constants";
import type { SectionEntry } from "@/server/api/DepartmentInfo";

export interface SpotsAvailableEmailProps {
  email: string;
  key: string;
  sectionEntry: SectionEntry;
  numberOfStudentsWatching: number;
}
const SpotsAvailableEmail = ({ sectionEntry, key }: SpotsAvailableEmailProps) => {
  const spotsAvailable = sectionEntry.available;
  const className = sectionEntry.courseName;
  const courseID = sectionEntry.courseID;
  const section = sectionEntry.sectionNumber;
  const spotText = spotsAvailable === 1 ? "spot" : "spots";
  const previewText = `${spotsAvailable} ${spotText} available in ${courseID}`;
  return (
    <EmailBase previewText={previewText}>
      <Text className="text-black text-[24px] font-bold text-center p-0 mt-6 mx-0">{previewText}</Text>
      <Section className="mx-auto mt-6">
        <Row>
          <Text className="text-black text-[16px] px-2 m-0">
            You are receiving this email because you requested to be notified when spots opened up for {courseID},{" "}
            {className}- Section {section}.
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
        href={`${baseDomain}/watch?key=${key}&section=${section}`}
      >
        Continue receiving notifications
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
  numberOfStudentsWatching: 2,
  sectionEntry: {
    available: 26,
    courseID: "CSCI-201",
    courseName: "Principles of Software Development",
    sectionNumber: "29904",
  },
  key: "asf",
  email: "jdecaro@usc.edu",
} as SpotsAvailableEmailProps;

export default SpotsAvailableEmail;
