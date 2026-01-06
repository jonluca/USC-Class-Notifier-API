import "dotenv/config";

import { AsyncTask, SimpleIntervalJob, ToadScheduler } from "toad-scheduler";
import { prisma } from "@/server/db";
import { paidProcessedEmail } from "@/emails/processors/paidProcessedEmail";
import logger from "@/server/logger";

export const sendPaidNotificationsEmails = async () => {
  // Find all sections where isPaid is true but paidNotified is false
  const sectionsToNotify = await prisma.watchedSection.findMany({
    where: {
      isPaid: true,
      paidNotified: false,
    },
    include: {
      student: true,
      ClassInfo: true,
    },
  });

  if (sectionsToNotify.length === 0) {
    return;
  }

  logger.info(`Sending ${sectionsToNotify.length} payment succeeded emails`);

  for (const section of sectionsToNotify) {
    try {
      await paidProcessedEmail({
        email: section.student.email,
        verificationKey: section.student.verificationKey,
        sectionEntry: section,
        classInfo: section.ClassInfo,
      });

      // Mark as notified after successful email send
      await prisma.watchedSection.update({
        where: { id: section.id },
        data: { paidNotified: true },
      });
    } catch (error) {
      logger.error(`Failed to send paid notification for section ${section.id}: ${error}`);
    }
  }

  logger.info("Finished sending paid notifications");
};
