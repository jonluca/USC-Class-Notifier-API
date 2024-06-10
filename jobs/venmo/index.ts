import "dotenv/config";
import { VenmoClient } from "./clients/venmo";
import logger from "@/server/logger";
import { AsyncTask, SimpleIntervalJob, ToadScheduler } from "toad-scheduler";
import { sendMessage } from "@/server/Twilio";
const client = new VenmoClient();

let lastSuccess: null | Date = null;
const checkVenmoPosts = async () => {
  let attempts = 0;
  while (attempts < 3) {
    try {
      logger.info("Checking for new posts");
      const cookieJar = client.jar.toJSON();
      const authCookie = cookieJar.cookies.find((l) => l.key === "api_access_token");
      if (!authCookie) {
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
const job = new SimpleIntervalJob({ minutes: 15 }, task, { preventOverrun: true });
scheduler.addSimpleIntervalJob(job);
logger.info("Scheduled venmo data update");
if (process.env.RUN_NOW) {
  checkVenmoPosts();
}
