import { LemmyHttp, PostId, CommentId } from "lemmy-js-client";
import { DEFAULT_INSTANCE } from "@/constants/settings";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let comment_id = body.comment_id || undefined;
    let save = body.save || undefined;
    let auth = body.auth || undefined;
    let instance = body.instance || undefined;

    if (!comment_id || !auth || !save) throw new Error("missing parameters");

    let client: LemmyHttp = new LemmyHttp(
      instance ? `https://${instance}` : DEFAULT_INSTANCE,
    );

    let response = await client.saveComment({
      comment_id: comment_id as unknown as CommentId,
      save: save as unknown as boolean,
      auth: auth as unknown as string,
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("saveComment Error:", e);
    return new Response(JSON.stringify({ error: e }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
