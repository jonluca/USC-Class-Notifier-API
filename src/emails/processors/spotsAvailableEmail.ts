import sendEmail from "../utilities/sendEmail";
import type { SpotsAvailableEmailProps } from "~/emails/SpotsAvailableEmail";
import SpotsAvailableEmail from "~/emails/SpotsAvailableEmail";
import { prisma } from "~/server/db";

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
  await sendEmail({
    EmailTemplate: SpotsAvailableEmail(props),
    recipient: email,
    subject,
    previewText: subject,
  });
  await prisma.notificationSent.create({
    data: {
      sectionId: props.section.id,
      studentId: props.student.id,
    },
  });
};
