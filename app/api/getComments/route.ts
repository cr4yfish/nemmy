import { LemmyHttp, PostId, CommentId, CommentSortType, CommunityId, ListingType } from "lemmy-js-client"
import { DEFAULT_INSTANCE } from "@/constants/settings";

export const dynamic = "force-dynamic"


export async function GET(req: Request) {
    try {

        // get params from Resuest
        let params = new URL(req.url).searchParams;
        
        let type_ = params.get("type_") || "All";
        let sort = params.get("sort") || "Top";
        let max_depth = params.get("max_depth") || 10;
        let page = params.get("page") || 1;
        let limit = params.get("limit") || 10;
        let community_id = params.get("community_id") || 0; // Required
        let community_name = params.get("community_name") || undefined;
        let post_id = params.get("post_id") || "0"; // Required
        let parent_id = params.get("parent_id") || undefined;
        let saved_only = params.get("saved_only") || undefined;
        let auth = params.get("auth") || undefined;
        let baseUrl = params.get("baseUrl") || DEFAULT_INSTANCE;

        if(!post_id) throw new Error("post_id is required");

        let client: LemmyHttp = new LemmyHttp(DEFAULT_INSTANCE);

        let comments = await client.getComments({
            // one of these is causing an error right now
            type_: type_ as unknown as ListingType,
            sort: sort as unknown as CommentSortType,
            max_depth: max_depth as unknown as number,
            page: page as unknown as number,
            limit: limit as unknown as number,
            //community_id: community_id as unknown as CommunityId,
            //community_name: community_name as unknown as string,
            post_id: post_id as unknown as PostId,
            parent_id: parent_id as unknown as CommentId,
            //saved_only: saved_only as unknown as boolean,
            auth: auth as unknown as string,
        })

        return new Response(JSON.stringify(comments), { status: 200, headers: { 'Content-Type': 'application/json' } })

    } catch (e: any) {
        console.error(e);
        return new Response(JSON.stringify({ error: e }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}