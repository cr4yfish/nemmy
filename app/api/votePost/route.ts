import { LemmyHttp } from "lemmy-js-client";
import { DEFAULT_INSTANCE } from "@/constants/settings";

import { getClient } from "@/utils/lemmy";

// POST /api/getUser
// Post for security reasons
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // is either post_id or comment_id, depending on isComment
    let post_id = (body.post_id as number) || undefined;

    let score = body.score as number;
    let auth = (body.auth as string) || undefined;

    // determines if post or comment is liked
    let isComment = (body.isComment as boolean) || false;

    let instance = body.instance || undefined;

    if (!post_id || (score === undefined )|| !auth) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const reqBody = {
      score: score,
      auth: auth,
    };

    let client: LemmyHttp = getClient(instance);
    let response = !isComment
      ? await client.likePost({
          ...reqBody,
          post_id: post_id,
        })
      : await client.likeComment({
          ...reqBody,
          comment_id: post_id,
        });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("GetUser Error:", e);
    return new Response(JSON.stringify({ error: e }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
