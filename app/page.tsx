import { LemmyHttp, PostView } from "lemmy-js-client"
import { cookies } from "next/dist/client/components/headers";

import FeedPage from "@/components/PageComponents/FeedPage";

import { getCurrentAccountServerSide } from "@/utils/authFunctions";

import { DEFAULT_INSTANCE, nextInstance } from "@/constants/settings";

export const revalidate = 60 * 2; // 2 minutes

async function getInitialPosts({ instance } : {  instance: string }) {
  const client = new LemmyHttp( false ? `https://${instance}` : DEFAULT_INSTANCE );
  return (await client.getPosts({
    type_: "All",
    sort: "Active",
    page: 1,
  })).posts;
}

export default async function Home() {
  const cookiesStore = cookies();
  const currentAccount = getCurrentAccountServerSide(cookiesStore);

  let instance = DEFAULT_INSTANCE;

  // {} is the default value if the cookie is not set
  if(currentAccount) {
    instance = currentAccount.instance;
  }

  let posts: PostView[] = [];
  try {
    posts = await getInitialPosts({ instance: instance });
  } catch (e) {
    console.error("Instance not available, switching instances");

    let isError = true;
    while(isError) {
      try {
        // switch to next instance
        nextInstance();
        posts = await getInitialPosts({ instance: DEFAULT_INSTANCE });
        isError = false; // stop loop
      } catch (e) {
        // continue in loop
        console.error("Instance not available, switching instances");
      }
    }
  }

  return (
    <div id="feed" className={`flex min-h-screen flex-col items-center mt-24`}>

      <FeedPage initPosts={posts} fetchParams={{ page: 2 }}
        instance={instance} jwt={currentAccount?.jwt}
      />
      
    </div>
  )
}
