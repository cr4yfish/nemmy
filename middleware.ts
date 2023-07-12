import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    let jwt = req.cookies.get("jwt");

    if(jwt?.value.length == 0) {
        req.cookies.delete("jwt");
    }

    const response = NextResponse.next();

    return response;
}

export const config = {
    matcher: "/api/:path*",
}