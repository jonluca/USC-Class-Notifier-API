import "pino-datadog-transport";
import "pino-pretty";
import type { TransportTargetOptions } from "pino";
import { pino } from "pino";
import { type NextApiRequest } from "next";
import type { IncomingMessage } from "http";

interface LoggerOptions {
  path: string;
  req?: NextApiRequest | IncomingMessage | null;
}

export const isProd = process.env.NODE_ENV === "production";

export class PinoLogger {
  private static instance: pino.Logger<string>;
  private static getInstance() {
    if (!PinoLogger.instance) {
      PinoLogger.instance = PinoLogger.createBaseLogger();
    }
    return PinoLogger.instance;
  }

  private static createBaseLogger = (): pino.Logger<string> => {
    // in prod, only log errors or warns
    const transports: TransportTargetOptions[] = [
      {
        target: "pino-pretty",
        level: "info",
        options: {
          colorize: true,
          hideObject: true,
          destination: 1,
        },
      },
    ];
    const transport = pino.transport({
      targets: transports,
    });

    return pino(transport);
  };
  /*
  The logger we use inherits the bindings and transport from the parent singleton instance
  Use child loggers to avoid creating a new instance for every trpc call
  */
  public static logger = ({ path, req }: LoggerOptions) => {
    return PinoLogger.getInstance().child({
      path,
      requestHeaders: req?.headers,
      trace_id: (req?.headers || {})["x-datadog-trace-id"],
    });
  };
}
