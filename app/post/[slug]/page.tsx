// Server component

import { LemmyHttp, PostId } from "lemmy-js-client";
import { cookies } from "next/dist/client/components/headers";
import { cache } from "react";
import { ResolvingMetadata, Metadata } from "next";

import { DEFAULT_INSTANCE } from "@/constants/settings";

import { getCurrentAccountServerSide } from "@/utils/authFunctions";

import PostPage from "@/components/PageComponents/PostPage";

const getPostData = cache(
  async (postId: number, jwt?: string, instance?: string) => {
    try {
      let client: LemmyHttp = new LemmyHttp(
        instance ? `https://${instance}` : DEFAULT_INSTANCE,
      );

      let posts = await client.getPost({
        id: postId as unknown as PostId,
        auth: jwt as unknown as string,
      });

      return posts;
    } catch (e) {
      // Force default instance, disable auth
      let client: LemmyHttp = new LemmyHttp(DEFAULT_INSTANCE);

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
  const postData = await getPostData(slug, instance);

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
  const cookieStore = cookies();
  const currentAccount = getCurrentAccountServerSide(cookieStore);

  // Data has been preloaded, so we don't need to fetch it again
  if (false && preload) {
    return (
      <>
        <PostPage
          instance={currentAccount?.instance}
          jwt={currentAccount?.jwt}
          shallow
          postId={slug}
        />
      </>
    );
  }

  const postData = (
    await getPostData(
      slug,
      currentAccount?.jwt,
      instance || currentAccount?.instance,
    )
  ).post_view;

  return (
    <>
      <PostPage
        data={postData}
        instance={currentAccount?.instance}
        postInstance={instance}
        jwt={currentAccount?.jwt}
        postId={slug}
      />
    </>
  );
}
