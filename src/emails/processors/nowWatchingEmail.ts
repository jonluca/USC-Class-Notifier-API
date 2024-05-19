import sendEmail from "../utilities/sendEmail";
import type { NowWatchingEmailProps } from "~/emails/NowWatchingEmail";
import NowWatchingEmail from "~/emails/NowWatchingEmail";

export const nowWatchingEmail = async (props: NowWatchingEmailProps) => {
  const { email, sectionEntry } = props;
  const headerTitle = sectionEntry.fullCourseId || `${sectionEntry.department} - ${sectionEntry.sectionNumber}`;
  const subject = `Watching ${headerTitle}!`;
  await sendEmail({
    EmailTemplate: NowWatchingEmail(props),
    recipient: email,
    subject,
    previewText: subject,
  });
};
