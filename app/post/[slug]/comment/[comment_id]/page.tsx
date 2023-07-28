// Server component

import { CommentResponse, LemmyHttp, PostId } from "lemmy-js-client";
import { cookies } from "next/dist/client/components/headers";

import { DEFAULT_INSTANCE } from "@/constants/settings";

import { getCurrentAccountServerSide } from "@/utils/authFunctions";

import PostPage from "@/components/PageComponents/PostPage";


async function getPostData (postId: number, jwt?: string, instance?: string) {

    try {
        let client: LemmyHttp = new LemmyHttp(instance ? `https://${instance}` : DEFAULT_INSTANCE);

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
}

async function getCommmentData(commentId: number, jwt?: string, instance?: string): Promise<CommentResponse | void> {
    try {
        let client: LemmyHttp = new LemmyHttp(instance ? `https://${instance}` : DEFAULT_INSTANCE);

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

export default async function Comment({ params: { slug, comment_id }, searchParams: { preload } } : { params: { slug: number, comment_id: number }, searchParams: { preload: boolean } }) {
    const cookieStore = cookies();
    const currentAccount = getCurrentAccountServerSide(cookieStore);

    const postData = (await getPostData(slug, currentAccount?.jwt, currentAccount?.instance)).post_view;
    const commentData = await getCommmentData(comment_id, currentAccount?.jwt, currentAccount?.instance)

    if(!postData || !commentData) {
        return (
            <div>
                <h1>Cant find the data</h1>
            </div>
        )
    }

    return (
        <>
        <PostPage 
            data={postData}
            instance={currentAccount?.instance}
            jwt={currentAccount?.jwt}
            postId={slug}
            commentResponse={commentData}
        />
        </>
    )
}