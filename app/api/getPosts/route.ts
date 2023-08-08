import {
  LemmyHttp,
  ListingType,
  SortType,
  CommunityId,
  GetPostResponse,
  GetPostsResponse,
  PostView,
} from "lemmy-js-client";
import { DEFAULT_INSTANCE, DEFAULT_POST_LIMIT } from "@/constants/settings";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // get params from Resuest
    let params = new URL(req.url).searchParams;

    let type_ = params.get("type_") || "All";
    let limit = params.get("limit") || DEFAULT_POST_LIMIT;
    let page = params.get("page") || 1;
    let sort = params.get("sort") || "Active";
    let community_id = params.get("community_id") || undefined;
    let community_name = params.get("community_name") || undefined;
    let saved_only = params.get("saved_only") || undefined;
    let auth = params.get("auth") || undefined;
    const instance = params.get("instance") || undefined;

    let community_name_array: Array<string> = [];

    if (community_name == "undefined") {
      community_name = undefined;
      community_name_array = [];
    } else if (community_name) {
      community_name = community_name?.replace("%40", "@");

      if (Array.isArray(JSON.parse(community_name))) {
        community_name = JSON.parse(community_name);
        if (!community_name) return;
        community_name_array = community_name as unknown as string[];
      } else {
        community_name_array.push(JSON.parse(community_name));
      }
    }

    let client: LemmyHttp = new LemmyHttp(
      instance && instance.length > 1 && instance !== "undefined"
        ? `https://${instance}`
        : DEFAULT_INSTANCE,
    );

    let posts: Array<PostView> = [];

    if (community_name_array.length == 0) {
      const newPosts = await client.getPosts({
        type_: type_ as unknown as ListingType,
        sort: sort as unknown as SortType,
        page: page as unknown as number,
        limit: limit as unknown as number,
        community_id: community_id as unknown as CommunityId,
        saved_only: saved_only as unknown as boolean,
        auth: auth as unknown as string,
      });
      posts.push(...newPosts.posts);
    } else {
      for (const community of community_name_array) {
        const newPosts = await client.getPosts({
          type_: type_ as unknown as ListingType,
          sort: sort as unknown as SortType,
          page: page as unknown as number,
          community_id: community_id as unknown as CommunityId,
          community_name: community as string,
          saved_only: saved_only as unknown as boolean,
          auth: auth as unknown as string,
        });
        posts.push(...newPosts.posts);
      }
    }

    if (Array.isArray(posts)) {
      // Regain requested sort order
      switch (sort) {
        case "Active":
          // Sort by post.counts.hot_rank_active
          posts = posts.sort((a, b) => {
            return b.counts.hot_rank_active - a.counts.hot_rank_active;
          });
          break;
        case "Hot":
          // Sort by post.counts.hot_rank
          posts = posts.sort((a, b) => {
            return b.counts.hot_rank - a.counts.hot_rank;
          });
          break;
        case "New":
          // Sort by post.post.published
          posts = posts.sort((a, b) => {
            return parseInt(b.post.published) - parseInt(a.post.published);
          });
          break;
        // TODO other sorts
      }
    }

    return new Response(JSON.stringify(posts), {
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
