import "dotenv/config";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { convert } from "html-to-text";
import { prisma } from "@/server/db.ts";
import { sendPaidNotificationsEmails } from "@/server/paid-notifications-emails.ts";
import logger from "@/server/logger.ts";

/**
 * ENV:
 *  GMAIL_IMAP_USER=yourname@gmail.com
 *  GMAIL_IMAP_APP_PASSWORD=xxxx xxxx xxxx xxxx   (16-char app password, spaces optional)
 */
export class GmailVenmoImapClient {
  private processedUids = new Set<number>();
  private submitPaidIds = async (ids: string[]) => {
    const result = await prisma.watchedSection.updateMany({
      where: {
        paidId: {
          in: ids,
        },
        isPaid: false,
      },
      data: {
        isPaid: true,
      },
    });
    return result.count;
  };
  private parsePaidIds(text: string): string[] {
    const valid = new Set<string>();
    if (!text) return [];

    // numbers on their own lines
    for (const line of text.split("\n")) {
      const t = line.trim();
      if (/^\d{8}$/.test(t)) valid.add(t);
    }

    // regex fallback - find all 8-digit numbers
    const matches = text.match(/\b\d{8}\b/g);
    if (matches) matches.forEach((m) => valid.add(m));

    return [...valid];
  }

  private normalizeBody(parsed: Awaited<ReturnType<typeof simpleParser>>): string {
    if (parsed.text && parsed.text.trim()) return parsed.text;

    if (parsed.html) {
      return convert(parsed.html.toString(), { wordwrap: false });
    }

    return "";
  }

  async fetchVenmoPaidYouIds(): Promise<string[]> {
    const user = process.env.GMAIL_IMAP_USER;
    const pass = process.env.GMAIL_IMAP_APP_PASSWORD;

    if (!user) throw new Error("GMAIL_IMAP_USER not set");
    if (!pass) throw new Error("GMAIL_IMAP_APP_PASSWORD not set");

    const client = new ImapFlow({
      host: "imap.gmail.com",
      port: 993,
      secure: true,
      auth: {
        user,
        pass: pass.replace(/\s+/g, ""), // app password sometimes pasted with spaces
      },
      logger: false,
    });

    const allPaidIds: string[] = [];

    try {
      await client.connect();

      // Gmail supports the "All Mail" mailbox for searching across archived+inbox.
      // If it doesn't exist (rare), fall back to INBOX.
      const gmailAllMail = "[Gmail]/All Mail";
      try {
        await client.mailboxOpen(gmailAllMail);
      } catch {
        await client.mailboxOpen("INBOX");
      }

      // IMAP SEARCH is not identical to Gmail web search, but sender filters work well.
      // Search criteria: FROM venmo@venmo.com, and limit to recent messages by date.
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const uids = await client.search({
        since,
        from: "venmo@venmo.com",
      });

      if (!uids) {
        logger.warn("No emails found");
        return [];
      }
      // Fetch newest first
      uids.sort((a, b) => b - a);

      for await (const msg of client.fetch(uids, { uid: true, envelope: true, source: true })) {
        const uid = msg.uid;
        if (this.processedUids.has(uid)) continue;

        const subject = msg.envelope?.subject ?? "";

        // Match your prior logic
        if (!subject.toLowerCase().includes("paid you")) continue;

        const text = msg.source?.toString();
        if (!text) {
          continue;
        }
        const parsed = await simpleParser(text);
        const bodyText = this.normalizeBody(parsed);

        const ids = this.parsePaidIds(bodyText);
        if (ids.length) allPaidIds.push(...ids);

        this.processedUids.add(uid);
      }
    } finally {
      // close connection cleanly
      try {
        await client.logout();
      } catch {
        // ignore
      }
    }

    return allPaidIds;
  }

  checkEmails = async (): Promise<void> => {
    const paidIds = await this.fetchVenmoPaidYouIds();
    if (paidIds.length === 0) {
      return;
    }

    const updatedCount = await this.submitPaidIds(paidIds);
    logger.info(`Marked ${updatedCount} sections as paid based on Venmo emails`);
    if (updatedCount) {
      await sendPaidNotificationsEmails();
    }
  };
}
