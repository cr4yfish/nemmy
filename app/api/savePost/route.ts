import { LemmyHttp, PostId, CommentId } from "lemmy-js-client"
import { DEFAULT_INSTANCE } from "@/constants/settings";

export async function POST(req: Request) {
    try {

        const body = await req.json();

        let post_id = body.post_id || undefined;
        let save = body.save || false;
        let auth = body.auth || undefined;
        let instance = body.instance || undefined;

        console.log("savePost", post_id, save, auth, instance)

        if(!post_id || !auth) throw new Error("missing parameters");

        let client: LemmyHttp = new LemmyHttp(instance ? `https://${instance}` : DEFAULT_INSTANCE);
        
        let response = await client.savePost({
            post_id: post_id as unknown as PostId,
            save: save as boolean,
            auth: auth as unknown as string,
        })

        return new Response(JSON.stringify(response), { status: 200, headers: { 'Content-Type': 'application/json' } })

    } catch (e: any) {
        console.error("savePost Error:",e);
        return new Response(JSON.stringify({ error: e }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}