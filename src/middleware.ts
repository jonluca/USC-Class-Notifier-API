import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAuthenticated } from "@/server/auth";

export function middleware(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": "Basic" },
    });
  }

  return NextResponse.next();
}

// Step 3. Configure "Matching Paths" below to protect routes with HTTP Basic Auth
export const config = {
  matcher: "/admin/:path*",
};
