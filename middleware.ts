import { cookies } from "next/dist/client/components/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export async function middleware(req: NextRequest) {
  const response = NextResponse.next();

  const accounts = req.cookies.get("accounts");
  const currentAccount = req.cookies.get("currentAccount");
  const defaultAccount = req.cookies.get("defaultAccount");

  // Wipe old system
  if (accounts?.value && currentAccount?.value && defaultAccount?.value) {
    if (JSON.parse(currentAccount.value || "").hasOwnProperty("jwt")) {
      console.log("Wiping old system");
      response.cookies.delete("accounts");
      response.cookies.delete("currentAccount");
      response.cookies.delete("defaultAccount");
    }
  }

  return response;
}

export const config = {
  matcher: "/",
};
