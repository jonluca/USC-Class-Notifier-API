import assert from "node:assert/strict";
import test from "node:test";
import {
  deliverAvailabilityNotification,
  hasRecordedEmailSinceLastNotification,
  NotificationChannelError,
  sendAndRecordEmailDelivery,
} from "./notificationDelivery.ts";

test("a failed email is never recorded as sent", async () => {
  const providerError = new Error("SES unavailable");
  let recorded = false;

  await assert.rejects(
    sendAndRecordEmailDelivery({
      sendEmail: async () => {
        throw providerError;
      },
      recordEmail: async () => {
        recorded = true;
      },
    }),
    (error) => error === providerError,
  );

  assert.equal(recorded, false);
});

test("an email failure stops delivery before SMS or persistence", async () => {
  const calls: string[] = [];
  const providerError = new Error("SES unavailable");

  await assert.rejects(
    deliverAvailabilityNotification({
      emailAlreadySent: false,
      sendEmail: async () => {
        calls.push("email");
        throw providerError;
      },
      sendSms: async () => {
        calls.push("sms");
      },
      markNotified: async () => {
        calls.push("mark");
      },
    }),
    (error) =>
      error instanceof NotificationChannelError && error.channel === "email" && error.originalError === providerError,
  );

  assert.deepEqual(calls, ["email"]);
});

test("an SMS failure leaves the watch pending after a successful email", async () => {
  const calls: string[] = [];
  const providerError = new Error("Twilio unavailable");

  await assert.rejects(
    deliverAvailabilityNotification({
      emailAlreadySent: false,
      sendEmail: async () => {
        calls.push("email");
      },
      sendSms: async () => {
        calls.push("sms");
        throw providerError;
      },
      markNotified: async () => {
        calls.push("mark");
      },
    }),
    (error) =>
      error instanceof NotificationChannelError && error.channel === "sms" && error.originalError === providerError,
  );

  assert.deepEqual(calls, ["email", "sms"]);
});

test("a recorded email is not resent while retrying SMS", async () => {
  const calls: string[] = [];

  await deliverAvailabilityNotification({
    emailAlreadySent: true,
    sendEmail: async () => {
      calls.push("email");
    },
    sendSms: async () => {
      calls.push("sms");
    },
    markNotified: async () => {
      calls.push("mark");
    },
  });

  assert.deepEqual(calls, ["sms", "mark"]);
});

test("an email-only notification is marked after email succeeds", async () => {
  const calls: string[] = [];

  await deliverAvailabilityNotification({
    emailAlreadySent: false,
    sendEmail: async () => {
      calls.push("email");
    },
    markNotified: async () => {
      calls.push("mark");
    },
  });

  assert.deepEqual(calls, ["email", "mark"]);
});

test("only an email record newer than lastNotified belongs to the current delivery", () => {
  const lastNotified = new Date("2026-07-11T10:00:00.000Z");

  assert.equal(
    hasRecordedEmailSinceLastNotification({
      latestEmailSentAt: new Date("2026-07-11T10:00:01.000Z"),
      lastNotified,
    }),
    true,
  );
  assert.equal(
    hasRecordedEmailSinceLastNotification({
      latestEmailSentAt: new Date("2026-07-11T09:59:59.000Z"),
      lastNotified,
    }),
    false,
  );
  assert.equal(
    hasRecordedEmailSinceLastNotification({
      latestEmailSentAt: new Date("2026-07-11T10:00:01.000Z"),
      lastNotified: null,
    }),
    true,
  );
  assert.equal(hasRecordedEmailSinceLastNotification({ latestEmailSentAt: null, lastNotified }), false);
});
