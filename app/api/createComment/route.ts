import { LemmyHttp, PostId, CommentId } from "lemmy-js-client"
import { DEFAULT_INSTANCE } from "@/constants/settings";

export async function POST(req: Request) {
    try {

        const body = await req.json();

        let post_id = body.post_id || undefined;
        let content = body.content || undefined;
        let auth = body.auth || undefined;
        let language_id = body.language_id || undefined;
        let form_id = body.form_id || undefined;
        let parent_id = body.parent_id || undefined;

        if(!content || !post_id || !auth) throw new Error("missing parameters");

        let client: LemmyHttp = new LemmyHttp(DEFAULT_INSTANCE);

        let response = await client.createComment({
            content: content as unknown as string,
            post_id: post_id as unknown as PostId,
            parent_id: parent_id as unknown as CommentId,
            auth: auth as unknown as string,
        })

        return new Response(JSON.stringify(response), { status: 200, headers: { 'Content-Type': 'application/json' } })

    } catch (e: any) {
        console.error("createComment Error:",e);
        return new Response(JSON.stringify({ error: e }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}