import { LemmyHttp, ListingType, SortType, CommunityId } from "lemmy-js-client"
import { DEFAULT_INSTANCE } from "@/constants/settings";

export async function GET(req: Request) {
    try {

        // get params from Resuest
        let params = new URL(req.url).searchParams;
        
        let id = params.get("community_id") || undefined;
        let name = params.get("community_name") || undefined;
        let auth = params.get("auth") || undefined;
        
        let client: LemmyHttp = new LemmyHttp(DEFAULT_INSTANCE);
        let community = await client.getCommunity({ 
            id: id as unknown as CommunityId,
            name: name as unknown as string,
            auth: auth as unknown as string,
        });

        return new Response(JSON.stringify(community), { status: 200, headers: { 'Content-Type': 'application/json' } })

    } catch (e: any) {
        console.error(e);
        return new Response(JSON.stringify({ error: e }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}