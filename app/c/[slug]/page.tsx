import { LemmyHttp } from "lemmy-js-client";
import { cookies } from "next/dist/client/components/headers";
import { ResolvingMetadata, Metadata } from "next";
import { cache } from "react";

import { getCurrentAccountServerSide } from "@/utils/authFunctions";

import { DEFAULT_INSTANCE } from "@/constants/settings";

import CommunityPage from "@/components/PageComponents/CommunityPage";

const getInitialCommunity = cache(async (communityName: string, instance?: string) => {
  const client = new LemmyHttp(
    instance ? `https://${instance}` : DEFAULT_INSTANCE,
  );
  return await client.getCommunity({ name: communityName });
})

type Props = {
  params: { slug: string };
}

export async function generateMetadata({ params: { slug }}: Props, parent?: ResolvingMetadata): Promise<Metadata> {
  const instance = slug.split("%40")[1];
  const communityName = slug.split("%40")[0];
  const communityResponse = await getInitialCommunity(communityName, instance);

  const community = communityResponse.community_view.community;

  return {
    title: community.name + " - Nemmy",
    description: community.description ? community.description.slice(0, 100) + "..." : `View the c/${community.name} Community on Nemmy.'.`,
  };
}

export default async function Community({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const communityName = slug.replace("%40", "@");
  const communityInstance = communityName.split("@")[1];

  const cookiesStore = cookies();
  const account = getCurrentAccountServerSide(cookiesStore);

  const community = await getInitialCommunity(communityName, account?.instance);

  return (
    <>
      <CommunityPage
        initialCommunity={community}
        communityInstance={communityInstance}
      />
    </>
  );
}
