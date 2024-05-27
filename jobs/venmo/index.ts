import "dotenv/config";
import { VenmoClient } from "./clients/venmo";
import logger from "@/server/logger";
import { AsyncTask, SimpleIntervalJob, ToadScheduler } from "toad-scheduler";
import { sendMessage } from "@/server/Twilio";
import dayjs from "dayjs";
const client = new VenmoClient();

const checkVenmoPosts = async () => {
  let attempts = 0;
  while (attempts < 3) {
    try {
      logger.info("Checking for new posts");

      const authCookie = client.jar.getCookiesSync("https://venmo.com").find((l) => l.key === "api_access_token");
      const now = dayjs().subtract(2, "minute").toDate(); // subtract 2 minutes to account for time it takes to make requests
      if (!authCookie || authCookie.expires < now) {
        await client.login();
      }
      await client.checkPosts();
      logger.info("Finished checking for venmo posts");
      return;
    } catch (e) {
      attempts++;
      if (attempts >= 2) {
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
