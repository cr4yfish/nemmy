import { LemmyHttp, PostId, CommentId } from "lemmy-js-client"

export async function GET(req: Request) {
    try {

        // get params from Resuest
        let params = new URL(req.url).searchParams;
        let auth = params.get("auth") || "";
        let instance = params.get("instance") || undefined;

        let client: LemmyHttp = new LemmyHttp((instance && instance !== "undefined") ? `https://${instance}` : "https://lemmy.world");

        let instances = await client.getFederatedInstances({ 
            auth: auth as unknown as string,
        });

        return new Response(JSON.stringify(instances), { status: 200, headers: { 'Content-Type': 'application/json' } })

    } catch (e: any) {
        console.error(e);
        return new Response(JSON.stringify({ error: e }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}