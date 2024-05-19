import tw from "twilio";
import logger from "~/server/logger";
import { isProd } from "~/server/config/logger";
const { Twilio } = tw;

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const FROM_NUMBER = process.env.FROM_NUMBER!;
const client = new Twilio(accountSid, authToken);

export const sendMessage = async ({ to, message }: { message: string; to: string }) => {
  if (!accountSid || !authToken) {
    logger.error(`Error sending text message: missing accountSid or authToken`);
    return;
  }
  if (!isProd && to !== process.env.TO_NUMBER) {
    return;
  }
  await client.messages.create(
    {
      body: message,
      to,
      from: FROM_NUMBER,
    },
    (err, message) => {
      if (err) {
        logger.error(`Error sending text with error: ${err}`);
        return;
      }
      logger.debug(`Sent text message to: ${message?.to}`);
    },
  );
};
