import type { LeveledLogMethod, LoggerOptions } from "winston";
import winston from "winston";
import { partition } from "lodash-es";
const { combine, timestamp, printf, colorize, errors, splat, json } = winston.format;
export const winstonTimestamp = timestamp({
  format: "YYYY-MM-DD HH:mm:ss",
});
const winstonPrint = () =>
  printf((info) => {
    if (typeof info.message === "object") {
      info.message = JSON.stringify(info.message);
    }
    return (
      `[${info.timestamp}] [${info.level}] - ${info.message}` +
      (info.splat !== undefined ? `${info.splat}` : " ") +
      (info.stack !== undefined ? `\n${info.stack}` : " ")
    );
  });

export const localFormat = () =>
  combine(winstonTimestamp, colorize(), splat(), errors({ stack: true }), winstonPrint());
interface CustomLogger extends winston.Logger {
  baseError: LeveledLogMethod;
}

const consoleTransport = new winston.transports.Console({
  format: localFormat(),
});

const transports: LoggerOptions["transports"] = [consoleTransport];

const logger = winston.createLogger({
  level: "debug",
  exitOnError: false,
  transports,
}) as CustomLogger;
logger.baseError = logger.error;
const oldError = logger.error;
logger.error = ((...args) => {
  let err = args[0] || {};
  if (!(err instanceof Error)) {
    const stack = new Error().stack;
    if (typeof err === "string") {
      err = { message: err, stack };
    } else {
      // todo deal with arrays?
      err.stack = stack;
    }
  }

  if (!err.message) {
    err.message = "Unknown error";
  }
  try {
    args[0] = JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)));
  } catch (e) {
    // weird error, just log it
    console.error(e);
  }

  // @ts-ignore
  return oldError(...args);
}) as LeveledLogMethod;

// @ts-ignore
const getArgs = (args: any[]) => {
  const [strings, others] = partition(args, (arg) => typeof arg === "string");
  return [strings.join(" "), ...others];
};
// @ts-ignore
console.log = (...args: any[]) => logger.info.call(logger, ...getArgs(args));
// @ts-ignore
console.info = (...args: any[]) => logger.info.call(logger, ...getArgs(args));
// @ts-ignore
console.warn = (...args: any[]) => logger.warn.call(logger, ...getArgs(args));
// @ts-ignore
console.error = (...args: any[]) => logger.error.call(logger, ...getArgs(args));
// @ts-ignore
console.debug = (...args: any[]) => logger.debug.call(logger, ...getArgs(args));
export default logger;
