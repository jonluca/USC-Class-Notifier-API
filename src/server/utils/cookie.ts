import { parseCookie, stringifySetCookie } from "cookie";
import type { IncomingMessage, ServerResponse } from "http";
import type { NextApiRequest } from "next";
import type { NextRequest } from "next/server";

type IncomingReq =
  | IncomingMessage
  | (IncomingMessage & { cookies: Partial<{ [key: string]: string }> })
  | NextApiRequest
  | NextRequest
  | null
  | undefined;

function getCookieHeader(req: IncomingReq) {
  if (!req?.headers) {
    return;
  }

  return req.headers instanceof Headers ? req.headers.get("cookie") || undefined : req.headers.cookie;
}

export function getCookies(req: IncomingReq) {
  const cookieHeader = getCookieHeader(req);
  if (!cookieHeader) {
    return {};
  }
  return parseCookie(cookieHeader);
}

export function getCookie(req: IncomingReq, name: string) {
  const cookieHeader = getCookieHeader(req);
  if (!cookieHeader) {
    return;
  }
  const cookies = parseCookie(cookieHeader);
  return cookies[name];
}

export function setCookie(
  res: ServerResponse<IncomingMessage>,
  name: string,
  value: string,
  options?: {
    expires?: Date;
    httpOnly?: boolean;
    path?: string;
    sameSite?: boolean | "lax" | "strict" | "none";
    secure?: boolean;
  },
) {
  res.setHeader("Set-Cookie", stringifySetCookie({ name, value, ...options }));
}
