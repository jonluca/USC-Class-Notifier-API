import "dotenv/config";
import { VenmoClient } from "./clients/venmo";
import logger from "@/server/logger";
import { AsyncTask, SimpleIntervalJob, ToadScheduler } from "toad-scheduler";
import { sendMessage } from "@/server/Twilio";
const client = new VenmoClient();
import dayjs from "dayjs";

let lastSuccess: null | Date = null;
const checkVenmoPosts = async () => {
  let attempts = 0;
  while (attempts < 3) {
    try {
      logger.info("Checking for new posts");
      const authCookie = client.jar.getCookiesSync("https://venmo.com").find((l) => l.key === "api_access_token");
      const now = dayjs().subtract(2, "minute").toDate(); // subtract 2 minutes to account for time it takes to make requests
      if (!authCookie || !authCookie.expires || authCookie.expires < now) {
        await client.login();
      }
      lastSuccess = new Date();
      await client.checkPosts();
      logger.info("Finished checking for venmo posts");
      return;
    } catch (e) {
      client.csrfToken = undefined;
      attempts++;
      // if we haven't successfully checked in the last 24 hours, send a message
      const shouldNotify = !lastSuccess || new Date().getTime() - lastSuccess.getTime() > 1000 * 60 * 60 * 24;
      if (attempts >= 2 && shouldNotify) {
        await sendMessage({ to: process.env.TO_NUMBER!, message: `Error checking venmo posts: ${e}` });
      }
      logger.error(e);
    }
  }
};

const scheduler = new ToadScheduler();

const task = new AsyncTask("Venmo checker", checkVenmoPosts, (err: Error) => {
  logger.error(err);
});

const job = new SimpleIntervalJob({ minutes: 15, runImmediately: Boolean(process.env.RUN_NOW) }, task, {
  preventOverrun: true,
});

scheduler.addSimpleIntervalJob(job);
logger.info("Scheduled venmo data update");
