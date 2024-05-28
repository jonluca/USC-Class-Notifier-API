import sendEmail from "../utilities/sendEmail";
import type { SpotsAvailableEmailProps } from "@/emails/SpotsAvailableEmail";
import SpotsAvailableEmail from "@/emails/SpotsAvailableEmail";
import { prisma } from "@/server/db";
import logger from "@/server/logger";

export const spotsAvailableEmail = async (
  props: SpotsAvailableEmailProps & {
    section: { id: string };
    student: { id: string };
  },
) => {
  const { email, sectionEntry } = props;
  const spotsAvailable = sectionEntry.available;
  const className = sectionEntry.courseID;
  const spotText = spotsAvailable === 1 ? "spot" : "spots";
  const subject = `${spotsAvailable} ${spotText} open for ${className}!`;
  const sectionId = props.section.id;
  await sendEmail({
    EmailTemplate: SpotsAvailableEmail(props),
    recipient: email,
    subject,
    previewText: subject,
  });
  await prisma.notificationSent.create({
    data: {
      sectionId,
      studentId: props.student.id,
    },
  });
  logger.info(`Sent spots available email to ${email} for ${sectionId} - ${className}`);
};
