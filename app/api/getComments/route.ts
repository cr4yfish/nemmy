import { LemmyHttp, PostId, CommentId, CommentSortType, CommunityId, ListingType } from "lemmy-js-client"

export async function GET(req: Request) {
    try {

        // get params from Resuest
        let params = new URL(req.url).searchParams;
        
        let type_ = params.get("type_") || "All";
        let sort = params.get("sort") || "Top";
        let max_depth = params.get("max_depth");
        let page = params.get("page");
        let limit = params.get("limit");
        let community_id = params.get("community_id"); // Required
        let community_name = params.get("community_name");
        let post_id = params.get("post_id") || "0"; // Required
        let parent_id = params.get("parent_id");
        let saved_only = params.get("saved_only");
        let auth = params.get("auth");
        let baseUrl = params.get("baseUrl") || "lemmy.world";

        if(!post_id) throw new Error("post_id is required");

        let client: LemmyHttp = new LemmyHttp(`https://lemmy.world`);

        console.log("Get comments", {
            type_,
            sort,
            max_depth,
            page,
            limit,
            community_id,
            community_name,
            post_id,
            parent_id,
            saved_only,
            auth,
            baseUrl
        })

        let comments = await client.getComments({
            // one of these is causing an error right now
            type_: type_ as unknown as ListingType,
            sort: sort as unknown as CommentSortType,
            max_depth: max_depth as unknown as number,
            
            // Is page even doing anything?
            page: page as unknown as number,

            //limit: limit as unknown as number,
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