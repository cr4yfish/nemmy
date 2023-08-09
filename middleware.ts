import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export async function middleware(req: NextRequest) {
  const response = NextResponse.next();

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
