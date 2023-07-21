import { DEFAULT_INSTANCE } from "@/constants/settings";
import { LemmyHttp} from "lemmy-js-client"

export async function GET(req: Request) {
    try {

        // get params from Resuest
        let params = new URL(req.url).searchParams;
        
        let auth = params.get("auth");
        let instance = params.get("instance");

        if(!auth) throw new Error("auth is required");

        let client: LemmyHttp = new LemmyHttp(instance ? `https://${instance}` : DEFAULT_INSTANCE);

        let unreadCount = await client.getUnreadCount({ 
            auth: auth as unknown as string, 
        });

        return new Response(JSON.stringify(unreadCount), { status: 200, headers: { 'Content-Type': 'application/json' } })

    } catch (e: any) {
        console.error(e);
        return new Response(JSON.stringify({ error: e }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}