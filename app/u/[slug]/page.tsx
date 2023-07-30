import { cookies } from "next/dist/client/components/headers";
import { GetPersonDetailsResponse, LemmyHttp } from "lemmy-js-client";
import { ResolvingMetadata, Metadata } from "next";
import { cache } from "react";

import UserPage from "@/components/PageComponents/UserPage";

import { getCurrentAccountServerSide } from "@/utils/authFunctions";
import { DEFAULT_INSTANCE } from "@/constants/settings";

const getInitialUser = cache(async (
  username: string,
  instance?: string,
): Promise<GetPersonDetailsResponse> => {
  const client = new LemmyHttp(
    instance ? `https://${instance}` : DEFAULT_INSTANCE,
  );
  return await client.getPersonDetails({ username });
})

type Props = {
  params: { slug: string };
}

export async function generateMetadata({ params: { slug }}: Props, parent?: ResolvingMetadata): Promise<Metadata> {
  const instance = slug.split("%40")[1];
  const username = slug.split("%40")[0];
  const user = await getInitialUser(username, instance);

  return {
    title: user.person_view.person.name + " - Nemmy",
    description: user.person_view.person.bio ? user.person_view.person.bio.slice(0, 100) + "..." : `View ${user.person_view.person.name}'s profile on Nemmy.'.`,
  };
}

export default async function User({ params: { slug } }: Props) {
  const userName = slug.replace("%40", "@");
  const userInstance = userName.split("@")[1];

  const cookiesStore = cookies();
  const account = getCurrentAccountServerSide(cookiesStore);

  const initialUser = await getInitialUser(userName, account?.instance);

  return (
    <>
      <UserPage initialUser={initialUser} userInstance={userInstance} />
    </>
  );
}
