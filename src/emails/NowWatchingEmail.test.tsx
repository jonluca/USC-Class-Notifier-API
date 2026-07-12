import assert from "node:assert/strict";
import test from "node:test";
import NowWatchingEmail, { type NowWatchingEmailProps } from "@/emails/NowWatchingEmail";
import renderEmailTemplate from "@/emails/utilities/renderEmailTemplate";

const props = {
  verificationKey: "test-key",
  email: "student@example.com",
  sectionEntry: {
    id: "watch-id",
    section: "37905",
    semester: "20263",
    notified: false,
    paidId: "12345678",
  },
  classInfo: null,
  showVenmoInfo: false,
} as NowWatchingEmailProps;

test("unverified accounts receive an activation link", async () => {
  const html = await renderEmailTemplate(NowWatchingEmail({ ...props, isVerifiedAccount: false }));

  assert.match(html, /Verify Email &amp; View Dashboard/);
  assert.match(html, /\/verify\?key=test-key/);
});

test("verified accounts link directly to their dashboard", async () => {
  const html = await renderEmailTemplate(NowWatchingEmail({ ...props, isVerifiedAccount: true }));

  assert.match(html, />View Dashboard</);
  assert.match(html, /\/dashboard\?key=test-key/);
});
