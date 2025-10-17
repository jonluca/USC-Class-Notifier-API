import "dotenv/config";

import { AsyncTask, SimpleIntervalJob, ToadScheduler } from "toad-scheduler";
import { createClassInfo, runRefresh } from "@/server/api/controller";
import logger from "@/server/logger";
import { isProd } from "@/constants";

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

logger.info(`Starting monitor jobs - ${isProd ? "PROD" : "DEV"}`);
scheduler.addSimpleIntervalJob(job);
scheduler.addSimpleIntervalJob(classInfoJob);
