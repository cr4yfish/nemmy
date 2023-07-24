import { LemmyHttp, ListingType, SortType, CommunityId } from "lemmy-js-client"
import { DEFAULT_INSTANCE, DEFAULT_POST_LIMIT } from "@/constants/settings";

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
    try {

        // get params from Resuest
        let params = new URL(req.url).searchParams;
        
        let type_ = params.get("type_") || "All";
        let limit = params.get("limit") || DEFAULT_POST_LIMIT;
        let page = params.get("page") || 1;
        let sort = params.get("sort") || "Active";
        let community_id = params.get("community_id") || undefined;
        let community_name = params.get("community_name") || undefined;
        let saved_only = params.get("saved_only") || undefined;
        let auth = params.get("auth") || undefined;

        if(community_name == "undefined") community_name = undefined;
        
        let client: LemmyHttp = new LemmyHttp(DEFAULT_INSTANCE);
        let posts = await client.getPosts({ 
            type_: type_ as unknown as ListingType,
            sort: sort as unknown as SortType,
            page: page as unknown as number, 
            community_id: community_id as unknown as CommunityId,
            community_name: community_name as unknown as string,
            saved_only: saved_only as unknown as boolean,
            auth: auth as unknown as string,
        });

        return new Response(JSON.stringify(posts), { status: 200, headers: { 'Content-Type': 'application/json' } })

    } catch (e: any) {
        console.error(e);
        return new Response(JSON.stringify({ error: e }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}