import { LemmyHttp, PostId, CommentId } from "lemmy-js-client";
import { DEFAULT_INSTANCE } from "@/constants/settings";

import { getClient } from "@/utils/lemmy";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let name = body.name || undefined;
    let community_id = body.community_id || undefined;
    let url = body.url || undefined;
    let body_content = body.body || undefined;
    let honeypot = body.honeypot || undefined;
    let nsfw = body.nsfw || undefined;
    let language_id = body.language_id || undefined;
    let auth = body.auth || undefined;
    let instance = body.instance || undefined;

    if (!name || !community_id || !auth) throw new Error("missing parameters");

    let client: LemmyHttp = getClient(instance);

    let response = await client.createPost({
      name: name,
      community_id: community_id,
      url: url,
      body: body_content,
      honeypot: honeypot,
      nsfw: nsfw,
      language_id: language_id,
      auth: auth,
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("createComment Error:", e);
    return new Response(JSON.stringify({ error: e }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
