import "dotenv/config";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import renderEmailTemplate from "./renderEmailTemplate";
import type React from "react";
import { isProd } from "@/constants";

const sendEmail = async ({
  EmailTemplate,
  recipient,
  subject,
  previewText,
}: {
  EmailTemplate: React.ReactElement;
  recipient: string;
  subject: string;
  previewText: string;
}) => {
  if (!isProd && recipient !== "usc-schedule-helper@jonlu.ca") {
    recipient = "usc-schedule-helper@jonlu.ca";
  }
  const client = new SESClient({
    region: "us-east-1",
  });

  const html = await renderEmailTemplate(EmailTemplate);

  const params = {
    Source: "USC Schedule Helper <schedule-helper@jonlu.ca>",
    Destination: {
      ToAddresses: [recipient],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: "UTF-8",
      },
      Body: {
        Text: {
          Data: previewText,
          Charset: "UTF-8",
        },
        Html: {
          Data: html,
          Charset: "UTF-8",
        },
      },
    },
  };

  const command = new SendEmailCommand(params);

  try {
    await client.send(command);
  } catch (error) {
    console.error("SES sending error:", error);
  }
};

export default sendEmail;
