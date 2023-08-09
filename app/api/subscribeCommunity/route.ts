import { LemmyHttp, CommunityId } from "lemmy-js-client";
import { DEFAULT_INSTANCE } from "@/constants/settings";

import { getClient } from "@/utils/lemmy";

// POST /api/subscribeToCommunity
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const community_id = body.community_id || undefined;
    const follow = body.follow || false;
    const auth = body.auth || undefined;
    const instance = body.instance || undefined;

    let client: LemmyHttp = getClient(instance);
    let communityResponse = await client.followCommunity({
      community_id: community_id as unknown as CommunityId,
      follow: follow as unknown as boolean,
      auth: auth as unknown as string,
    });

    return new Response(JSON.stringify(communityResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("Search Error:", e);
    return new Response(JSON.stringify({ error: e }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
