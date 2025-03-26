import { Button, Row, Section, Text, Link } from "@react-email/components";
import * as React from "react";
import EmailBase from "./components/EmailBase";
import { baseDomain } from "@/constants";
import type { WatchedSection, ClassInfo } from "@prisma/client";

export interface NowWatchingEmailProps {
  verificationKey: string;
  email: string;
  sectionEntry: WatchedSection;
  classInfo: ClassInfo | null;
  showVenmoInfo?: boolean;
}
const NowWatchingEmail = ({ classInfo, sectionEntry, verificationKey, showVenmoInfo }: NowWatchingEmailProps) => {
  const headerTitle = classInfo?.courseNumber;
  const previewText = `Watching ${headerTitle}!`;

  return (
    <EmailBase previewText={previewText}>
      <Text className="text-black text-[24px] font-bold text-center p-0 mt-6 mx-0">{previewText}</Text>
      <Section className="mx-auto mt-6">
        <Row>
          <Text className="text-black text-[16px] px-2 m-0">
            You are now watching {headerTitle ? `${headerTitle} - ` : ""}Section {sectionEntry.section}.
          </Text>
          {showVenmoInfo && (
            <>
              <Text className="text-black text-[16px] px-2 pt-4 m-0">
                To receive text notifications, send a venmo to{" "}
                <Link href={"https://venmo.com/u/jonluca"}>@JonLuca</Link> with just the following code in it:
              </Text>
              <Text className="text-black text-[24px] p-2 m-0 font-bold w-full text-center">{sectionEntry.paidId}</Text>
            </>
          )}
        </Row>
      </Section>
      {showVenmoInfo && (
        <>
          <Button
            className="bg-black rounded-xl text-white font-bold no-underline text-center py-2 w-full text-lg mt-4"
            href={`venmo://paycharge?txn=pay&recipients=JonLuca&amount=1&note=${sectionEntry.paidId}`}
          >
            Send Venmo (app)
          </Button>
          <Button
            className="bg-black rounded-xl text-white font-bold no-underline text-center py-2 w-full text-lg mt-4"
            href={`https://account.venmo.com/pay?recipients=JonLuca&amount=1&note=${sectionEntry.paidId}`}
          >
            Send Venmo (website)
          </Button>
        </>
      )}
      <Button
        className="bg-black rounded-xl text-white font-bold no-underline text-center py-2 w-full text-lg mt-4"
        href={`${baseDomain}/dashboard?key=${verificationKey}`}
      >
        View Dashboard
      </Button>
    </EmailBase>
  );
};

// @ts-ignore
NowWatchingEmail.PreviewProps = {
  sectionEntry: {
    id: "123",
    section: "12345",
    semester: "20243",
    notified: false,
    paidId: "12345678",
  },
  showVenmoInfo: true,
  email: "usc-schedule-helper@jonlu.ca",
  classInfo: {
    courseNumber: "CSCI 104",
    department: "CSCI",
    id: "123",
    name: "Data Structures",
  },
  verificationKey: "asdf",
} as NowWatchingEmailProps;

export default NowWatchingEmail;
