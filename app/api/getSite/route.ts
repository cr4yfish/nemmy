import { DEFAULT_INSTANCE } from "@/constants/settings";
import { LemmyHttp } from "lemmy-js-client";

import { getClient } from "@/utils/lemmy";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // get params from Resuest
    let params = new URL(req.url).searchParams;

    let auth = params.get("auth");
    let instance = params.get("instance") || undefined;

    if (!auth) throw new Error("auth is required");

    let client: LemmyHttp = getClient(instance);

    let site = await client.getSite({
      auth: auth as unknown as string,
    });

    return new Response(JSON.stringify(site), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ error: e }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
