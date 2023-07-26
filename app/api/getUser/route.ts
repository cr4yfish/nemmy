import { LemmyHttp, ListingType, SortType, CommunityId } from "lemmy-js-client"
import { DEFAULT_INSTANCE } from "@/constants/settings";

// POST /api/getUser
// Post for security reasons
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
    try {
        
        let params = new URL(req.url).searchParams;

        let id = params.get("id") || undefined;
        let username = params.get("username") || undefined;
        let sort = params.get("sort") || "Active";
        let limit = params.get("limit") || 10;
        let page = params.get("page") || 1;
        let auth = params.get("auth") || undefined;
        let instance = params.get("instance") || undefined;

        let client: LemmyHttp = new LemmyHttp((instance && instance.length > 1 && instance !== "undefined") ? `https://${instance}` : DEFAULT_INSTANCE);
        let person = await client.getPersonDetails({ 
            person_id: id as unknown as number,
            username: username as unknown as string,
            sort: sort as unknown as SortType,
            page: page as unknown as number,
            limit: limit as unknown as number,
            auth: auth as unknown as string,
        });

        return new Response(JSON.stringify(person), { status: 200, headers: { 'Content-Type': 'application/json' } })

    } catch (e: any) {
        console.error("GetUser Error:",e);
        return new Response(JSON.stringify({ error: e }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}