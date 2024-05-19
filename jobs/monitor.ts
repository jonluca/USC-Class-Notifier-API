import { AsyncTask, SimpleIntervalJob, ToadScheduler } from "toad-scheduler";
import { createClassInfo, runRefresh } from "~/server/api/controller";

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
  { hours: 24, runImmediately: true },
  new AsyncTask("Create class info", createClassInfo, (err: Error) => {
    console.error(err);
  }),
  {
    preventOverrun: true,
  },
);

// scheduler.addSimpleIntervalJob(job);
scheduler.addSimpleIntervalJob(classInfoJob);
