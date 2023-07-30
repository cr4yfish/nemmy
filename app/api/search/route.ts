import {
  LemmyHttp,
  ListingType,
  SortType,
  CommunityId,
  Search,
  SearchResponse,
  PersonId,
  SearchType,
} from "lemmy-js-client";
import { DEFAULT_INSTANCE } from "@/constants/settings";

// GET /api/search
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    let params = new URL(req.url).searchParams;

    let q = params.get("q") || undefined;
    let community_id = params.get("community_id") || "";
    let community_name = params.get("community_name") || "";
    let creator_id = params.get("creator_id") || "";
    let type_ = params.get("type_") || "All";
    let sort = params.get("sort") || "Hot";
    let listing_type = params.get("listing_type") || "All";
    let page = params.get("page") || 0;
    let limit = params.get("limit") || 25;
    let auth = params.get("auth") || "";

    let client: LemmyHttp = new LemmyHttp(DEFAULT_INSTANCE);
    let searchResponse = await client.search({
      q: q as unknown as string,
      community_id: community_id as unknown as CommunityId,
      community_name: community_name as unknown as string,
      creator_id: creator_id as unknown as PersonId,
      type_: type_ as unknown as SearchType,
      sort: sort as unknown as SortType,
      listing_type: listing_type as unknown as ListingType,

      page: page as unknown as number,
      limit: limit as unknown as number,
      auth: auth as unknown as string,
    });

    return new Response(JSON.stringify(searchResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("Search Error:", e);
    return new Response(JSON.stringify({ error: e }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
