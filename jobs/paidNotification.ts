import "dotenv/config";

import { AsyncTask, SimpleIntervalJob, ToadScheduler } from "toad-scheduler";
import { prisma } from "@/server/db";
import { paidProcessedEmail } from "@/emails/processors/paidProcessedEmail";
import logger from "@/server/logger";

const sendPaidNotifications = async () => {
  logger.info("Checking for paid sections that need notification");

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
    logger.info("No paid sections need notification");
    return;
  }

  logger.info(`Found ${sectionsToNotify.length} section(s) to notify`);

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

      logger.info(`Notified ${section.student.email} for section ${section.section}`);
    } catch (error) {
      logger.error(`Failed to send paid notification for section ${section.id}: ${error}`);
    }
  }

  logger.info("Finished sending paid notifications");
};

const scheduler = new ToadScheduler();

const task = new AsyncTask("Paid notification sender", sendPaidNotifications, (err: Error) => {
  logger.error("Error in paid notification task");
  logger.error(err);
});

const job = new SimpleIntervalJob({ minutes: 5, runImmediately: Boolean(process.env.RUN_NOW) }, task, {
  preventOverrun: true,
});

scheduler.addSimpleIntervalJob(job);
logger.info("Scheduled paid notification job");
