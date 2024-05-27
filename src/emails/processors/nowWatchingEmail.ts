import sendEmail from "../utilities/sendEmail";
import type { NowWatchingEmailProps } from "@/emails/NowWatchingEmail";
import NowWatchingEmail from "@/emails/NowWatchingEmail";
import { prisma } from "@/server/db";

export const nowWatchingEmail = async (props: NowWatchingEmailProps) => {
  const { email, sectionEntry } = props;
  const classInfo = await prisma.classInfo.findFirst({
    where: {
      semester: sectionEntry.semester,
      section: sectionEntry.section,
    },
  });
  const headerTitle = classInfo?.courseNumber || `section ${sectionEntry.section}`;
  const subject = `Watching ${headerTitle}!`;
  await sendEmail({
    EmailTemplate: NowWatchingEmail({ ...props, classInfo }),
    recipient: email,
    subject,
    previewText: subject,
  });
};
