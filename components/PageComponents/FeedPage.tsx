import { ListingType, SortType, CommunityId, PostView, GetPostResponse } from "lemmy-js-client"

import PostList from "../PostList"

export default function FeedPage({
    fetchParams, initPosts, instance, jwt
} : {
    fetchParams?: 
        {
            type_?: ListingType, sort?: SortType,
            page?: number, limit?: number,
            community_id?: CommunityId, community_name?: string,
            saved_only?: boolean, auth?: string
        },
    initPosts?: PostView[],
    instance: string,
    jwt?: string
}) {

    return (
        <>
        <PostList 
            fetchParams={fetchParams}
            initPosts={initPosts}
        />
        </>
    )
}