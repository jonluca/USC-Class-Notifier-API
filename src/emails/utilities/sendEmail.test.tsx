import assert from "node:assert/strict";
import test from "node:test";
import sendEmail from "./sendEmail.ts";

test("SES provider failures propagate to the caller", async () => {
  const providerError = new Error("SES unavailable");

  await assert.rejects(
    sendEmail(
      {
        EmailTemplate: <div>Test notification</div>,
        recipient: "student@example.com",
        subject: "Test",
        previewText: "Test notification",
      },
      {
        send: async () => {
          throw providerError;
        },
      },
    ),
    (error) => error === providerError,
  );
});
