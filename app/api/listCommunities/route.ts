import { LemmyHttp, ListingType, SortType } from "lemmy-js-client";
import { DEFAULT_INSTANCE } from "@/constants/settings";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    let params = new URL(req.url).searchParams;

    let type_ = params.get("type_") || "All";
    let sort = params.get("sort") || "Active";
    let page = params.get("page") || 1;
    let limit = params.get("limit") || undefined;
    let auth = params.get("auth") || undefined;
    let instance = params.get("instance") || undefined;

    let client: LemmyHttp = new LemmyHttp(
      instance && instance.length > 1 && instance !== "undefined"
        ? `https://${instance}`
        : DEFAULT_INSTANCE,
    );
    let communities = await client.listCommunities({
      type_: type_ as unknown as ListingType,
      auth: auth as unknown as string,
      sort: sort as unknown as SortType,
      page: page as unknown as number,
    });

    return new Response(JSON.stringify(communities), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ error: e }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
