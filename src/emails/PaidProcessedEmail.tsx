import { Button, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import EmailBase from "./components/EmailBase";
import { baseDomain } from "@/constants";
import type { WatchedSection, ClassInfo } from "@app/prisma";

export interface PaidProcessedEmailProps {
  verificationKey: string;
  email: string;
  sectionEntry: WatchedSection;
  classInfo: ClassInfo | null;
}

const PaidProcessedEmail = ({ classInfo, sectionEntry, verificationKey }: PaidProcessedEmailProps) => {
  const headerTitle = classInfo?.courseNumber || `Section ${sectionEntry.section}`;
  const previewText = `Payment received for ${headerTitle}!`;

  return (
    <EmailBase previewText={previewText}>
      <Text className="text-black text-[24px] font-bold text-center p-0 mt-6 mx-0">{previewText}</Text>
      <Section className="mx-auto mt-6">
        <Row>
          <Text className="text-black text-[16px] px-2 m-0">
            Your payment has been processed for {headerTitle ? `${headerTitle} - ` : ""}Section {sectionEntry.section}.
          </Text>
        </Row>
        <Row>
          <Text className="text-black text-[16px] px-2 pt-4 m-0">
            You will now receive text notifications when spots open up for this section.
          </Text>
        </Row>
      </Section>
      <Button
        className="bg-black rounded-xl text-white font-bold no-underline text-center py-2 w-full text-lg mt-4"
        href={`${baseDomain}/dashboard?key=${verificationKey}`}
      >
        View Dashboard
      </Button>
      <Button
        className="bg-violet-100 rounded-xl text-black font-bold no-underline text-center py-2 w-full text-lg mt-2"
        href={`${baseDomain}/faq?key=${verificationKey}`}
      >
        FAQ
      </Button>
    </EmailBase>
  );
};

// @ts-ignore
PaidProcessedEmail.PreviewProps = {
  sectionEntry: {
    id: "123",
    section: "12345",
    semester: "20243",
    notified: false,
    paidId: "12345678",
    isPaid: true,
    paidNotified: false,
  },
  email: "usc-schedule-helper@jonlu.ca",
  classInfo: {
    courseNumber: "CSCI 104",
    department: "CSCI",
    id: "123",
    name: "Data Structures",
  },
  verificationKey: "asdf",
} as PaidProcessedEmailProps;

export default PaidProcessedEmail;
