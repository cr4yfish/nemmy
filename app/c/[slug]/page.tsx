import { LemmyHttp } from "lemmy-js-client";
import { cookies } from "next/dist/client/components/headers";

import { getCurrentAccountServerSide } from "@/utils/authFunctions";

import { DEFAULT_INSTANCE } from "@/constants/settings";

import CommunityPage from "@/components/PageComponents/CommunityPage";

async function getInitialCommunity(communityName: string, instance?: string) {
  const client = new LemmyHttp(
    instance ? `https://${instance}` : DEFAULT_INSTANCE,
  );
  return await client.getCommunity({ name: communityName });
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
