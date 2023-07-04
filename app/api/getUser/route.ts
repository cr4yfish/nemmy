import { LemmyHttp, ListingType, SortType, CommunityId } from "lemmy-js-client"

export async function GET(req: Request) {
    try {

        // get params from Resuest
        let params = new URL(req.url).searchParams;
        
        let id = params.get("person_id") || undefined;
        let username = params.get("username") || undefined;
        let sort = params.get("sort") || "Hot";
        let page = params.get("page") || 1;
        let limit = params.get("limit") || 10;
        let auth = params.get("auth") || undefined;
        
        let client: LemmyHttp = new LemmyHttp("https://lemmy.world");
        let community = await client.getPersonDetails({ 
            person_id: id as unknown as number,
            username: username as unknown as string,
            sort: sort as unknown as SortType,
            page: page as unknown as number,
            limit: limit as unknown as number,
            auth: auth as unknown as string,
        });

        return new Response(JSON.stringify(community), { status: 200, headers: { 'Content-Type': 'application/json' } })

    } catch (e: any) {
        console.error(e);
        return new Response(JSON.stringify({ error: e }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}