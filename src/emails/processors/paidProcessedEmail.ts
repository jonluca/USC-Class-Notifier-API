import sendEmail from "../utilities/sendEmail";
import type { PaidProcessedEmailProps } from "@/emails/PaidProcessedEmail";
import PaidProcessedEmail from "@/emails/PaidProcessedEmail";
import { prisma } from "@/server/db";
import logger from "@/server/logger";

export const paidProcessedEmail = async (props: PaidProcessedEmailProps) => {
  const { email, sectionEntry } = props;
  const classInfo = await prisma.classInfo.findFirst({
    where: {
      semester: sectionEntry.semester,
      section: sectionEntry.section,
    },
  });
  const headerTitle = classInfo?.courseNumber || `Section ${sectionEntry.section}`;
  const subject = `Payment received for ${headerTitle}!`;
  await sendEmail({
    EmailTemplate: PaidProcessedEmail({ ...props, classInfo }),
    recipient: email,
    subject,
    previewText: subject,
  });
  logger.info(`Sent payment processed email to ${email} for section ${sectionEntry.section}`);
};
