import type { LeveledLogMethod, LoggerOptions } from "winston";
import winston from "winston";
import { partition } from "lodash-es";
const { combine, timestamp, printf, colorize, errors, splat } = winston.format;
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

// @ts-ignore
const getArgs = (args: any[]) => {
  const [strings, others] = partition(args, (arg) => typeof arg === "string");
  if (strings.length) {
    return [strings.join(" "), ...others];
  }
  return args;
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
