import { ListingType, SortType, GetSiteResponse, 
    CommunityId, PostView } from "lemmy-js-client"

import PostList from "../PostList"
import RenderMarkdown from "../ui/RenderMarkdown"
import SiteInfoCard from "../SiteInfoCard"

export default function FeedPage({
    fetchParams, initPosts, instance, jwt, siteResponse
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
    siteResponse: GetSiteResponse | null,
}) {


    return (
        <div className="flex flex-row justify-center gap-2">

            <PostList 
                fetchParams={fetchParams}
                initPosts={initPosts}
                
            />

            <SiteInfoCard siteResponse={siteResponse} />

        </div>
    )
}