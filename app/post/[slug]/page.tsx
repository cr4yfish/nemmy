// Server component
 
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { LemmyHttp, PostId } from "lemmy-js-client";

import { DEFAULT_INSTANCE } from "@/constants/settings";

import PostPage from "@/components/PostPage";
import { cookies } from "next/dist/client/components/headers";

async function getPostData (postId: string, jwt?: string, instance?: string) {

    let client: LemmyHttp = new LemmyHttp(instance ? `https://${instance}` : DEFAULT_INSTANCE);

    let posts = await client.getPost({ 
        id: postId as unknown as PostId, 
        auth: jwt as unknown as string,
    });
    return posts;
}

export default async function Post({ params: { slug } } : { params: { slug: string } }) {
    const cookieStore = cookies();
    const jwt = cookieStore.get("jwt")?.value, instance = cookieStore.get("instance")?.value;

    const postData = await getPostData(slug, jwt, instance);
    
    return (
        <>

        <PostPage 
            data={postData}
            instance={instance}
            jwt={jwt}
        />
        

        </>
    )
}