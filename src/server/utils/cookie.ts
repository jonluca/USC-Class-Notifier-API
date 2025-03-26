import * as cookie from "cookie";
import type { IncomingMessage, ServerResponse } from "http";
import type { NextApiRequest } from "next";

type IncomingReq =
  | IncomingMessage
  | (IncomingMessage & { cookies: Partial<{ [key: string]: string }> })
  | NextApiRequest
  | null
  | undefined;

export function getCookies(req: IncomingReq) {
  if (!req || !req.headers) {
    return {};
  }

  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    return {};
  }
  return cookie.parse(cookieHeader);
}

export function getCookie(req: IncomingReq, name: string) {
  if (!req || !req.headers) {
    return;
  }
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    return;
  }
  const cookies = cookie.parse(cookieHeader);
  return cookies[name];
}

export function setCookie(
  res: ServerResponse<IncomingMessage>,
  name: string,
  value: string,
  options?: {
    expires?: Date;
    httpOnly?: boolean;
  },
) {
  res.setHeader("Set-Cookie", cookie.serialize(name, value, options));
}
