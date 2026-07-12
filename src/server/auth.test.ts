import assert from "node:assert/strict";
import test from "node:test";
import type { IncomingMessage } from "node:http";
import type { NextRequest } from "next/server";
import { getVerificationKey } from "@/server/auth";

const requestWithCookies = (cookies: string) =>
  ({
    headers: { cookie: cookies },
  }) as IncomingMessage;

test("reads the current verification cookie", () => {
  assert.equal(getVerificationKey(requestWithCookies("verificationKey=current-user")), "current-user");
});

test("prefers the current cookie over a stale legacy cookie", () => {
  assert.equal(getVerificationKey(requestWithCookies("key=old-user; verificationKey=current-user")), "current-user");
});

test("supports the legacy cookie when no current cookie exists", () => {
  assert.equal(getVerificationKey(requestWithCookies("key=legacy-user")), "legacy-user");
});

test("reads cookies from NextRequest headers", () => {
  const request = { headers: new Headers({ cookie: "verificationKey=edge-user" }) } as NextRequest;

  assert.equal(getVerificationKey(request), "edge-user");
});
