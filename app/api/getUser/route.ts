import { LemmyHttp, ListingType, SortType, CommunityId } from "lemmy-js-client"
import jwt, { JwtPayload } from "jsonwebtoken";

// POST /api/getUser
// Post for security reasons
export async function POST(req: Request) {
    try {
        
        const body = await req.json();

        let id = body.person_id as number || undefined;
        let username = body.username || undefined;
        let sort = body.sort || "Hot";
        let page = body.page || 1;
        let limit = body.limit || 10;
        let auth = body.jwt || undefined;

        // decode auth
        let decode = jwt.decode(auth) as JwtPayload;
        const jwt_id = decode.sub;
        if(jwt_id && !id) {
            id = parseInt(jwt_id);
        }

        let client: LemmyHttp = new LemmyHttp("https://lemmy.world");
        let community = await client.getPersonDetails({ 
            person_id: id,
            username: username as unknown as string,
            sort: sort as unknown as SortType,
            page: page as unknown as number,
            limit: limit as unknown as number,
        });

        return new Response(JSON.stringify(community), { status: 200, headers: { 'Content-Type': 'application/json' } })

    } catch (e: any) {
        console.error("GetUser Error:",e);
        return new Response(JSON.stringify({ error: e }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}