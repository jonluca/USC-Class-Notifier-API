import type { NextRequest } from "next/server";
import type { IncomingMessage } from "http";

const adminPassword = process.env.ADMIN_PASSWORD;

export function isAuthenticated(req: NextRequest | IncomingMessage) {
  // req might be a NextRequest or an IncomingMessage
  // convert Headers | IncomingHttpHeaders to Headers
  const headers = req.headers instanceof Headers ? req.headers : new Headers(req.headers as any);
  const authheader = headers.get("authorization") || headers.get("Authorization");

  if (!authheader) {
    return false;
  }

  const auth = Buffer.from(authheader.split(" ")[1], "base64").toString().split(":");
  const pass = auth[1];

  if (adminPassword && pass == adminPassword) {
    return true;
  } else {
    return false;
  }
}

export const cookieKey = "verificationKey";
