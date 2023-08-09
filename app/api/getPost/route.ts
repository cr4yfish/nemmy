import { LemmyHttp, PostId, CommentId } from "lemmy-js-client";
import { DEFAULT_INSTANCE } from "@/constants/settings";

import { getClient } from "@/utils/lemmy";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // get params from Resuest
    let params = new URL(req.url).searchParams;

    let id = params.get("id");
    let comment_id = params.get("comment_id") || "0";
    let auth = params.get("auth") || "";
    let instance = params.get("instance") || undefined;

    if (!id) throw new Error("id is required");

    let client: LemmyHttp = getClient(instance);

    let posts = await client.getPost({
      id: id as unknown as PostId,
      comment_id: comment_id as unknown as CommentId,
      auth: auth as unknown as string,
    });

    return new Response(JSON.stringify(posts), {
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
