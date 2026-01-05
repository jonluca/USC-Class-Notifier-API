import { google, gmail_v1 } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import logger from "@/server/logger";
import { prisma } from "@/server/db";
import { convert } from "html-to-text";

export class GmailVenmoClient {
  private oauth2Client: OAuth2Client;
  private gmail: gmail_v1.Gmail;
  private processedMessageIds: Set<string> = new Set();

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      "70308730174-sfb9ckcn7cjj0biaggjf95sdcuet9isf.apps.googleusercontent.com",
      process.env.GMAIL_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground",
    );

    this.oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });

    this.gmail = google.gmail({ version: "v1", auth: this.oauth2Client });
  }

  private parseText = (message: string): string[] => {
    const valid = new Set<string>();
    try {
      if (!message) {
        return [];
      }

      // parse normal numbers on their own lines
      const nums = message.split("\n").filter((i) => /^\d+$/.test(i.trim()));
      for (const num of nums) {
        const payment_id = num.trim();
        if (payment_id.length === 8) {
          valid.add(payment_id);
        }
      }

      // if the message itself is just a single number, split out somehow
      const payment_id = nums.join("");
      if (payment_id.length === 8) {
        valid.add(payment_id);
      }

      // regex match fallback - find all 8-digit numbers
      const regex_match = message.match(/\b\d{8}\b/g);
      if (regex_match) {
        for (const match of regex_match) {
          valid.add(match);
        }
      }

      return Array.from(valid);
    } catch (e) {
      logger.error(`Error parsing text: ${message}`);
      logger.error(e);
      return Array.from(valid);
    }
  };

  private submitPaidIds = async (ids: string[]) => {
    const result = await prisma.watchedSection.updateMany({
      where: {
        paidId: {
          in: ids,
        },
      },
      data: {
        isPaid: true,
      },
    });
    return result.count;
  };

  private decodeBase64Url = (data: string): string => {
    // Gmail API returns base64url encoded data
    const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
    return Buffer.from(base64, "base64").toString("utf-8");
  };

  private getEmailBody = (payload: gmail_v1.Schema$MessagePart): string => {
    let body = "";

    if (payload.body?.data) {
      body = this.decodeBase64Url(payload.body.data);
    }

    // Handle multipart messages
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === "text/plain" && part.body?.data) {
          body += this.decodeBase64Url(part.body.data);
        } else if (part.mimeType === "text/html" && part.body?.data) {
          // Convert HTML to text as fallback
          const html = this.decodeBase64Url(part.body.data);
          body += convert(html, { wordwrap: false });
        } else if (part.parts) {
          // Recursively handle nested parts
          body += this.getEmailBody(part);
        }
      }
    }

    return body;
  };

  fetchVenmoEmails = async (): Promise<void> => {
    const userEmail = process.env.GMAIL_USER_EMAIL;
    if (!userEmail) {
      throw new Error("GMAIL_USER_EMAIL not set");
    }

    logger.info("Fetching Venmo emails from Gmail");

    // Search for emails from venmo@venmo.com in the last 7 days
    const query = "from:venmo@venmo.com newer_than:7d";

    const listResponse = await this.gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: 100,
    });

    const messages = listResponse.data.messages || [];
    logger.info(`Found ${messages.length} Venmo emails`);

    if (messages.length === 0) {
      return;
    }

    const allPaidIds: string[] = [];

    for (const messageRef of messages) {
      if (!messageRef.id) continue;

      // Skip if we've already processed this message in this session
      if (this.processedMessageIds.has(messageRef.id)) {
        continue;
      }

      try {
        const message = await this.gmail.users.messages.get({
          userId: "me",
          id: messageRef.id,
          format: "full",
        });

        const payload = message.data.payload;
        if (!payload) continue;

        // Get subject to help identify payment emails
        const subjectHeader = payload.headers?.find((h) => h.name?.toLowerCase() === "subject");
        const subject = subjectHeader?.value || "";

        // Look for payment notification emails (someone paid you)
        if (!subject.toLowerCase().includes("paid you")) {
          continue;
        }

        const body = this.getEmailBody(payload);
        const paidIds = this.parseText(body);

        if (paidIds.length > 0) {
          logger.info(`Found paid IDs in email "${subject}": ${paidIds.join(", ")}`);
          allPaidIds.push(...paidIds);
          this.processedMessageIds.add(messageRef.id);
        }
      } catch (e) {
        logger.error(`Error processing message ${messageRef.id}: ${e}`);
      }
    }

    if (allPaidIds.length > 0) {
      logger.info(`Submitting ${allPaidIds.length} paid IDs: ${allPaidIds.join(", ")}`);
      const updatedCount = await this.submitPaidIds(allPaidIds);
      logger.info(`Updated ${updatedCount} sections as paid`);
    } else {
      logger.info("No new paid IDs found in emails");
    }
  };

  checkEmails = async (): Promise<void> => {
    await this.fetchVenmoEmails();
  };
}
