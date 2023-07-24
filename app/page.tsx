import { LemmyHttp, PostView } from "lemmy-js-client"

import PostList from "@/components/PostList"
import { cookies } from "next/dist/client/components/headers";
import { Account, cookieDefaultAccountName } from "@/utils/authFunctions";
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
  const defaultAccountRaw = cookiesStore.get(cookieDefaultAccountName)?.value;

  let instance = DEFAULT_INSTANCE;

  // {} is the default value if the cookie is not set
  if(defaultAccountRaw && defaultAccountRaw.length > 3) {
    const defaultAccount: Account = JSON.parse(defaultAccountRaw);
    instance = defaultAccount.instance;
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
    <div id="postpage" className={`flex min-h-screen flex-col items-center mt-24`}>

      <PostList initPosts={posts} fetchParams={{ page: 2 }} />
      
    </div>
  )
}
