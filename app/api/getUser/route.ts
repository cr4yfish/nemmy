import { LemmyHttp, ListingType, SortType, CommunityId } from "lemmy-js-client"
import jwt, { JwtPayload } from "jsonwebtoken";

// POST /api/getUser
// Post for security reasons
export async function GET(req: Request) {
    try {
        
        let params = new URL(req.url).searchParams;

        let id = params.get("id") || undefined;
        let username = params.get("username") || undefined;
        let sort = params.get("sort") || "Hot";
        let limit = params.get("limit") || 10;
        let page = params.get("page") || 1;
        let auth = params.get("auth") || undefined;

        let client: LemmyHttp = new LemmyHttp("https://lemmy.world");
        let person = await client.getPersonDetails({ 
            person_id: id as unknown as number,
            username: username as unknown as string,
            sort: sort as unknown as SortType,
            page: page as unknown as number,
            limit: limit as unknown as number,
            auth: auth as unknown as string
        });

        return new Response(JSON.stringify(person), { status: 200, headers: { 'Content-Type': 'application/json' } })

    } catch (e: any) {
        console.error("GetUser Error:",e);
        return new Response(JSON.stringify({ error: e }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}