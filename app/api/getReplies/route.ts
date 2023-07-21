import { LemmyHttp, ListingType, SortType, CommunityId, CommentSortType } from "lemmy-js-client"
import { DEFAULT_INSTANCE } from "@/constants/settings";

export async function GET(req: Request) {
    try {

        // get params from Resuest
        let params = new URL(req.url).searchParams;
        
        let auth = params.get("auth");
        let sort = params.get("sort");
        let page = params.get("page");
        let unread_only = params.get("unread_only");
        let instance = params.get("instance");
        
        let client: LemmyHttp = new LemmyHttp(instance ? `https://${instance}` : DEFAULT_INSTANCE);
        let replies = await client.getReplies({ 
            auth: auth as unknown as string,
            sort: sort as unknown as CommentSortType,
            page: page as unknown as number,
            unread_only: unread_only as unknown as boolean
        });

        return new Response(JSON.stringify(replies), { status: 200, headers: { 'Content-Type': 'application/json' } })

    } catch (e: any) {
        console.error(e);
        return new Response(JSON.stringify({ error: e }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}