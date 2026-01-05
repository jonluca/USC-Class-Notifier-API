import "dotenv/config";
import { GmailVenmoImapClient } from "./gmailClient";
import logger from "@/server/logger";
import { AsyncTask, SimpleIntervalJob, ToadScheduler } from "toad-scheduler";
import { sendMessage } from "@/server/Twilio";
import dayjs from "dayjs";

const client = new GmailVenmoImapClient();

let lastSuccess: null | Date = null;
let consecutiveJobFailures = 0;
let pausedUntil: null | Date = null;

const checkVenmoEmails = async () => {
  // If paused due to consecutive failures, check if 12 hours have passed
  if (pausedUntil && new Date() < pausedUntil) {
    logger.info(`Venmo Gmail job paused until ${pausedUntil.toISOString()} due to consecutive failures`);
    return;
  }
  pausedUntil = null;

  let attempts = 0;
  while (attempts < 3) {
    try {
      logger.info("Checking for Venmo emails via Gmail API");
      await client.checkEmails();

      lastSuccess = new Date();
      consecutiveJobFailures = 0;
      logger.info("Finished checking Venmo emails");
      return;
    } catch (e) {
      attempts++;
      // if we haven't successfully checked in the last 24 hours, send a message
      const shouldNotify = !lastSuccess || new Date().getTime() - lastSuccess.getTime() > 1000 * 60 * 60 * 24;
      if (attempts >= 2 && shouldNotify) {
        await sendMessage({ to: process.env.TO_NUMBER!, message: `Error checking Venmo emails via Gmail: ${e}` });
      }
      logger.error(e);
    }
  }

  // All retries exhausted - this counts as a job failure
  consecutiveJobFailures++;
  if (consecutiveJobFailures >= 2) {
    pausedUntil = dayjs().add(12, "hour").toDate();
    logger.warn(
      `Venmo Gmail job failed ${consecutiveJobFailures} times in a row, pausing until ${pausedUntil.toISOString()}`,
    );
  }
};

const scheduler = new ToadScheduler();

const task = new AsyncTask("Venmo Gmail checker", checkVenmoEmails, (err: Error) => {
  logger.error("Error in Venmo Gmail checker task");
  logger.error(err);
});

const job = new SimpleIntervalJob({ minutes: 15, runImmediately: Boolean(process.env.RUN_NOW) }, task, {
  preventOverrun: true,
});

scheduler.addSimpleIntervalJob(job);
logger.info("Scheduled Venmo Gmail data update");
