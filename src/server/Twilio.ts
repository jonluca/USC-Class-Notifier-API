import tw from "twilio";
import { isProd } from "@/constants";
import logger from "@/server/logger";

const { Twilio } = tw;

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const fromNumber = process.env.FROM_NUMBER;
const client = new Twilio(accountSid, authToken);

interface SmsMessageClient {
  create(options: { body: string; to: string; from: string }): Promise<{ to?: string | null }>;
}

interface SmsSenderConfig {
  accountSid: string | undefined;
  authToken: string | undefined;
  fromNumber: string | undefined;
  isProduction: boolean;
  developmentNumber: string | undefined;
  messageClient: SmsMessageClient;
}

export const normalizeUsDestination = (destination: string) => {
  const trimmed = destination.trim();
  if (/^\+1\d{10}$/.test(trimmed)) {
    return trimmed;
  }

  // Only reinterpret values made up of digits and common phone formatting.
  // This avoids accidentally treating an international number or extension as US-local.
  if (/^[\d\s().-]+$/.test(trimmed)) {
    const digits = trimmed.replace(/\D/g, "");
    if (digits.length === 10) {
      return `+1${digits}`;
    }
  }

  return trimmed;
};

export const sendMessageWithClient = async (
  { to, message }: { message: string; to: string },
  config: SmsSenderConfig,
) => {
  if (!config.accountSid || !config.authToken) {
    throw new Error("Cannot send text message: missing Twilio account SID or auth token");
  }
  if (!config.fromNumber) {
    throw new Error("Cannot send text message: missing Twilio sender number");
  }

  const normalizedTo = normalizeUsDestination(to);
  const normalizedDevelopmentNumber = config.developmentNumber
    ? normalizeUsDestination(config.developmentNumber)
    : undefined;
  if (!config.isProduction && normalizedTo !== normalizedDevelopmentNumber) {
    return;
  }

  const sentMessage = await config.messageClient.create({
    body: message,
    to: normalizedTo,
    from: config.fromNumber,
  });
  logger.debug(`Sent text message to: ${sentMessage.to ?? normalizedTo}`);
};

export const sendMessage = async ({ to, message }: { message: string; to: string }) =>
  sendMessageWithClient(
    { to, message },
    {
      accountSid,
      authToken,
      fromNumber,
      isProduction: isProd,
      developmentNumber: process.env.TO_NUMBER,
      messageClient: {
        create: (options) => client.messages.create(options),
      },
    },
  );
