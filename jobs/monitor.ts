import "dotenv/config";

import { AsyncTask, SimpleIntervalJob, ToadScheduler } from "toad-scheduler";
import { createClassInfo, runRefresh } from "@/server/api/controller";
import logger from "@/server/logger";
import { isProd } from "@/constants";
import { GmailVenmoImapClient } from "./venmoGmail/gmailClient.ts";
import { sendMessage } from "@/server/Twilio.ts";

const scheduler = new ToadScheduler();
const job = new SimpleIntervalJob(
  { minutes: 5, runImmediately: true },
  new AsyncTask("Refresh classes", runRefresh, (err: Error) => {
    console.error(err);
  }),
  {
    preventOverrun: true,
  },
);
const classInfoJob = new SimpleIntervalJob(
  { hours: 24, runImmediately: false },
  new AsyncTask(
    "Create class info",
    () => createClassInfo(),
    (err: Error) => {
      console.error(err);
    },
  ),
  {
    preventOverrun: true,
  },
);

const client = new GmailVenmoImapClient();

const checkVenmoEmails = async () => {
  try {
    await client.checkEmails();
    return;
  } catch (e) {
    await sendMessage({ to: process.env.TO_NUMBER!, message: `Error checking Venmo emails via Gmail: ${e}` });
    logger.error(e);
  }
};

const gmailJob = new SimpleIntervalJob(
  { minutes: 15, runImmediately: Boolean(process.env.RUN_NOW) },
  new AsyncTask("Venmo Gmail checker", checkVenmoEmails, (err: Error) => {
    logger.error("Error in Venmo Gmail checker task");
    logger.error(err);
  }),
  {
    preventOverrun: true,
  },
);

logger.info(`Starting monitor jobs - ${isProd ? "PROD" : "DEV"}`);
scheduler.addSimpleIntervalJob(gmailJob);
scheduler.addSimpleIntervalJob(job);
scheduler.addSimpleIntervalJob(classInfoJob);
