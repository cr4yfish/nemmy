// Server component

import { LemmyHttp, PostId } from "lemmy-js-client";
import { cookies } from "next/dist/client/components/headers";
import { cache } from "react";
import { ResolvingMetadata, Metadata } from "next";

import { DEFAULT_INSTANCE } from "@/constants/settings";

import { getCurrentAccountServerSide } from "@/utils/authFunctions";

import PostPage from "@/components/PageComponents/PostPage";
import Navbar from "@/components/Navbar";
import { getClient } from "@/utils/lemmy";

const getPostData = cache(
  async (postId: number, jwt?: string, instance?: string) => {
    try {
      console.log("Getting post from instance", instance);
      let client: LemmyHttp = getClient(instance);

      let posts = await client.getPost({
        id: postId as unknown as PostId,
        auth: jwt as unknown as string,
      });

      return posts;
    } catch (e) {
      // Force default instance, disable auth
      let client: LemmyHttp = getClient();

      let posts = await client.getPost({
        id: postId as unknown as PostId,
      });

      return posts;
    }
  },
);

type Props = {
  params: { slug: number };
  searchParams: { preload: boolean; instance: string };
};

export async function generateMetadata(
  { params: { slug }, searchParams: { instance } }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const postData = await getPostData(slug, undefined, instance);

  return {
    title: postData.post_view.post.name + " - Nemmy",
    description: postData.post_view.post?.body
      ? postData.post_view.post.body.slice(0, 100) + "..."
      : `Post by ${postData.post_view.creator.name}.`,
  };
}

export default async function Post({
  params: { slug },
  searchParams: { preload, instance },
}: Props) {
  console.log(instance);
  const cookieStore = cookies();
  const currentAccount = getCurrentAccountServerSide(cookieStore);

  // Data has been preloaded, so we don't need to fetch it again
  if (false && preload) {
    return (
      <>
        <PostPage
          instance={currentAccount?.instanceAccounts[0]?.instance}
          jwt={currentAccount?.instanceAccounts[0]?.jwt || ""}
          shallow
          postId={slug}
        />
      </>
    );
  }

  const postData = (
    await getPostData(
      slug,
      currentAccount?.instanceAccounts[0]?.jwt,
      instance || currentAccount?.instanceAccounts[0]?.instance,
    )
  ).post_view;

  return (
    <>
      <PostPage
        data={postData}
        instance={currentAccount?.instanceAccounts[0]?.instance}
        postInstance={instance}
        jwt={currentAccount?.instanceAccounts[0]?.jwt || ""}
        postId={slug}
      />
    </>
  );
}
