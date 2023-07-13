import { LemmyHttp, ListingType, SortType } from "lemmy-js-client"

export async function GET(req: Request) {
    try {

        let params = new URL(req.url).searchParams;
        
        let type_ = params.get("type_") || undefined;
        let sort = params.get("sort") || undefined;
        let page = params.get("page") || undefined;
        let limit = params.get("limit") || undefined;
        let auth = params.get("auth") || undefined;
        
        let client: LemmyHttp = new LemmyHttp("https://lemmy.world");
        let communities = await client.listCommunities({ 
            type_: type_ as unknown as ListingType,
            auth: auth as unknown as string,
        });

        return new Response(JSON.stringify(communities), { status: 200, headers: { 'Content-Type': 'application/json' } })

    } catch (e: any) {
        console.error(e);
        return new Response(JSON.stringify({ error: e }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}