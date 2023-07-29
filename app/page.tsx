import { GetSiteResponse, LemmyHttp, PostView } from "lemmy-js-client"
import { cookies } from "next/dist/client/components/headers";

import FeedPage from "@/components/PageComponents/FeedPage";

import { getCurrentAccountServerSide } from "@/utils/authFunctions";

import { DEFAULT_INSTANCE, nextInstance } from "@/constants/settings";

export const revalidate = 60 * 2; // 2 minutes

async function getInitialPosts({ instance, auth="" } : {  instance: string, auth?: string }) {
  const client = new LemmyHttp( instance ? `https://${instance.replace("https://", "")}` : DEFAULT_INSTANCE );
  return (await client.getPosts({
    type_: "All",
    sort: "Active",
    page: 1,
    auth: auth
  })).posts;
}

async function getInitialSiteResponse(instance: string) {
  const client = new LemmyHttp( instance ? `https://${instance.replace("https://", "")}` : DEFAULT_INSTANCE );
  return await client.getSite();
}

export default async function Home() {
  const cookiesStore = cookies();
  const currentAccount = getCurrentAccountServerSide(cookiesStore);

  let instance = DEFAULT_INSTANCE;

  // {} is the default value if the cookie is not set
  if(currentAccount?.instance && currentAccount.instance.length > 0) {
    instance = currentAccount.instance;
  }

  let posts: PostView[] = [];
  let siteResponse: GetSiteResponse | null = null;
  try {
    posts = await getInitialPosts({ instance: instance, auth: currentAccount?.jwt });
    siteResponse = await getInitialSiteResponse(instance);
  } catch (e) {
    console.error("Instance not available, switching instances", instance, DEFAULT_INSTANCE);

    let isError = true;
    let step = 0;
    while(isError && step < 9) {
      try {
        // switch to next instance
        nextInstance();
        posts = await getInitialPosts({ instance: DEFAULT_INSTANCE });
        siteResponse = await getInitialSiteResponse(DEFAULT_INSTANCE)
        isError = false; // stop loop
      } catch (e) {
        // continue in loop
        step += 1;
        console.error("Instance not available, switching instances. Step:", step);
      }
    }
  }

  return (
    <div id="feed" className={`flex min-h-screen flex-col items-center mt-24`}>

      <FeedPage initPosts={posts} fetchParams={{ page: 2 }}
        instance={instance} jwt={currentAccount?.jwt}
        siteResponse={siteResponse}
      />
      
    </div>
  )
}
