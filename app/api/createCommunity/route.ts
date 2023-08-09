import { LemmyHttp } from "lemmy-js-client";
import { DEFAULT_INSTANCE } from "@/constants/settings";

import { getClient } from "@/utils/lemmy";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let name = body.name || undefined;
    let title = body.title || undefined;
    let description = body.description || undefined;
    let icon = body.icon || undefined;
    let banner = body.banner || undefined;
    let nsfw = body.nsfw || undefined;
    let posting_restricted_to_mods =
      body.posting_restricted_to_mods || undefined;
    let discussion_languages = body.discussion_languages || undefined;
    let auth = body.auth || undefined;
    let instance = body.instance || undefined;

    if (!name || !title || !auth)
      throw new Error("missing required parameters");

    let client: LemmyHttp = getClient(instance);

    let response = await client.createCommunity({
      name: name,
      title: title,
      description: description,
      icon: icon,
      banner: banner,
      nsfw: nsfw,
      posting_restricted_to_mods: posting_restricted_to_mods,
      discussion_languages: discussion_languages,
      auth: auth,
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("createCommunity Error:", e);
    return new Response(JSON.stringify({ error: e }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
