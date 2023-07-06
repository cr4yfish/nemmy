import { LemmyHttp } from "lemmy-js-client"

// POST /api/getUser
// Post for security reasons
export async function POST(req: Request) {
    try {
        
        const body = await req.json();

        let post_id = body.post_id as number || undefined;
        let score = body.score as number || undefined;
        let auth = body.auth as string || undefined;

        if(!post_id || !score || !auth) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }

        let client: LemmyHttp = new LemmyHttp("https://lemmy.world");
        let response = await client.likePost({ 
            post_id: post_id,
            score: score,
            auth: auth
        });

        return new Response(JSON.stringify(response), { status: 200, headers: { 'Content-Type': 'application/json' } })

    } catch (e: any) {
        console.error("GetUser Error:",e);
        return new Response(JSON.stringify({ error: e }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}