// Server component

import { CommentResponse, LemmyHttp, PostId } from "lemmy-js-client";
import { cookies } from "next/dist/client/components/headers";

import { DEFAULT_INSTANCE } from "@/constants/settings";

import { getCurrentAccountServerSide } from "@/utils/authFunctions";

import PostPage from "@/components/PageComponents/PostPage";
import { getClient } from "@/utils/lemmy";

async function getPostData(postId: number, jwt?: string, instance?: string) {
  try {
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
}

async function getCommmentData(
  commentId: number,
  jwt?: string,
  instance?: string,
): Promise<CommentResponse | void> {
  try {
    let client: LemmyHttp = getClient(instance);

    let comment = await client.getComment({
      id: commentId,
      auth: jwt as unknown as string,
    });

    return comment;
  } catch (e) {
    console.error(e);
    return;
  }
}

export default async function Comment({
  params: { slug, comment_id },
  searchParams: { preload },
}: {
  params: { slug: number; comment_id: number };
  searchParams: { preload: boolean };
}) {
  const cookieStore = cookies();
  const currentAccount = getCurrentAccountServerSide(cookieStore);

  const postData = (
    await getPostData(
      slug,
      currentAccount?.instanceAccounts.find(
        (ac) => ac.instance == currentAccount.instanceAccounts[0]?.instance,
      )?.jwt,
      currentAccount?.instanceAccounts[0]?.instance,
    )
  ).post_view;
  const commentData = await getCommmentData(
    comment_id,
    currentAccount?.instanceAccounts.find(
      (ac) => ac.instance == currentAccount.instanceAccounts[0]?.instance,
    )?.jwt,
    currentAccount?.instanceAccounts[0]?.instance,
  );

  if (!postData || !commentData) {
    return (
      <div>
        <h1>Cant find the data</h1>
      </div>
    );
  }

  return (
    <>
      <PostPage
        data={postData}
        instance={currentAccount?.instanceAccounts[0]?.instance}
        jwt={
          currentAccount?.instanceAccounts.find(
            (ac) => ac.instance == currentAccount.instanceAccounts[0]?.instance,
          )?.jwt || ""
        }
        postId={slug}
        commentResponse={commentData}
      />
    </>
  );
}
