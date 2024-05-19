import { Button, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import EmailBase from "./components/EmailBase";
import { baseDomain } from "~/constants";
import type { Section as WatchedSection } from "@prisma/client";

export interface NowWatchingEmailProps {
  key: string;
  email: string;
  sectionEntry: WatchedSection;
}
const NowWatchingEmail = ({ sectionEntry, key }: NowWatchingEmailProps) => {
  const headerTitle = sectionEntry.fullCourseId || `${sectionEntry.department} - ${sectionEntry.sectionNumber}`;
  const previewText = `Watching ${headerTitle}!`;

  return (
    <EmailBase previewText={previewText}>
      <Text className="text-black text-[24px] font-bold text-center p-0 mt-6 mx-0">{previewText}</Text>
      <Section className="mx-auto mt-6">
        <Row>
          <Text className="text-black text-[16px] px-2 m-0">You are now watching {headerTitle}.</Text>
          <Text className="text-black text-[16px] px-2 pt-4 m-0">
            To receive text notifications, send a venmo to @JonLuca with just the following code in it:
          </Text>
          <Text className="text-black text-[24px] p-2 m-0 font-bold w-full text-center">{sectionEntry.paidId}</Text>
        </Row>
      </Section>
      <Button
        className="bg-black rounded-xl text-white font-bold no-underline text-center py-2 w-full text-lg mt-4"
        href={`${baseDomain}/dashboard?key=${key}`}
      >
        View Dashboard
      </Button>
    </EmailBase>
  );
};

NowWatchingEmail.PreviewProps = {
  sectionEntry: {
    id: "123",
    fullCourseId: "CSCI-201",
    department: "CSCI",
    sectionNumber: "12345",
    semester: "20243",
    notified: false,
    paidId: "12345678",
  },
  key: "asdf",
  email: "jdecaro@usc.edu",
} as NowWatchingEmailProps;

export default NowWatchingEmail;
