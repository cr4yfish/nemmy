import { GetSiteResponse, LemmyHttp, PostView } from "lemmy-js-client";
import { cookies } from "next/dist/client/components/headers";

import { getClient } from "@/utils/lemmy";

import FeedPage from "@/components/PageComponents/FeedPage";
import Navbar from "@/components/Navbar";

import { getCurrentAccountServerSide } from "@/utils/authFunctions";

import { DEFAULT_INSTANCE, nextInstance } from "@/constants/settings";

export const revalidate = 60 * 2; // 2 minutes

async function getInitialPosts({
  instance,
  auth = "",
}: {
  instance: string;
  auth?: string;
}) {
  const client = getClient(instance);
  return (
    await client.getPosts({
      type_: "All",
      sort: "Active",
      page: 1,
      auth: auth,
    })
  ).posts;
}

async function getInitialSiteResponse(instance: string) {
  const client = getClient(instance);
  return await client.getSite();
}

export default async function Home() {
  const cookiesStore = cookies();
  const currentAccount = getCurrentAccountServerSide(cookiesStore);

  let instance = DEFAULT_INSTANCE;

  // {} is the default value if the cookie is not set
  if (
    currentAccount?.instanceAccounts &&
    currentAccount?.instanceAccounts[0]?.instance &&
    currentAccount.instanceAccounts[0]?.instance.length > 0
  ) {
    instance = currentAccount.instanceAccounts[0]?.instance;
  }

  let posts: PostView[] = [];
  let siteResponse: GetSiteResponse | null = null;
  try {
    posts = await getInitialPosts({
      instance: instance,
      auth: currentAccount?.instanceAccounts[0]?.jwt || "",
    });
    siteResponse = await getInitialSiteResponse(instance);
  } catch (e) {
    console.error(
      "Instance not available, switching instances",
      instance,
      DEFAULT_INSTANCE,
    );

    let isError = true;
    let step = 0;
    while (isError && step < 9) {
      try {
        // switch to next instance
        nextInstance();
        posts = await getInitialPosts({ instance: DEFAULT_INSTANCE });
        siteResponse = await getInitialSiteResponse(DEFAULT_INSTANCE);
        isError = false; // stop loop
      } catch (e) {
        // continue in loop
        step += 1;
        console.error(
          "Instance not available, switching instances. Step:",
          step,
        );
      }
    }
  }

  return (
    <>
      <Navbar />
      <div
        id="feed"
        className={`mt-24 flex min-h-screen flex-col items-center`}
      >
        <FeedPage
          initPosts={posts}
          fetchParams={{ page: 2 }}
          instance={
            new URL(siteResponse?.site_view.site.actor_id || "").host ||
            instance
          }
          siteResponse={siteResponse}
          currentAccount={currentAccount}
        />
      </div>
    </>
  );
}
