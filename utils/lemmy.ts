import { deleteCookie } from "cookies-next";
import { CommentResponse, CommentView, CreateComment, CreatePost, FollowCommunity, GetComments, GetCommentsResponse, GetPostResponse, GetSiteResponse, ListCommunities, ListCommunitiesResponse, PostResponse, Search, SearchResponse } from "lemmy-js-client"
import { FormEvent } from "react";

export const getUserDetails = async (jwt: string, baseUrl: string) :  Promise<(boolean | GetSiteResponse)> => {
    const user: GetSiteResponse = await fetch(`/api/getSite?auth=${jwt}&baseUrl=${baseUrl}`).then(res => res.json());
    return user as GetSiteResponse;
}

export const listCommunities = async (params : ListCommunities) :  Promise<(boolean | ListCommunitiesResponse)> => {
    const communities: ListCommunitiesResponse = await fetch(`/api/listCommunities?auth=${params.auth}&type_=${params.type_}&sort=${params.sort}&page=${params.page}&limit=${params.limit}`).then(res => res.json());
    if(!communities.communities) {
        console.warn("Could not retrieve communities");
        return false;
    }
    return communities as ListCommunitiesResponse;
}

export const createPost = async (params: CreatePost) : Promise<(boolean | PostResponse)> => {
    const response = await fetch(`/api/createPost`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    }).then(res => res.json());
    if(!response?.post_view.post?.id) {
        console.warn("Could not create post");
        return false;
    }
    return response as PostResponse;
}

export const sendComment = async (params: CreateComment) => {
    const data: CommentResponse = await fetch(`/api/createComment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: params.content, auth: params.auth, post_id: params.post_id, parent_id: params.parent_id })
    }).then(res => res.json());

    if(!data?.comment_view?.comment?.id) return alert("Something went wrong sending the comment");

    return data.comment_view;
}

export const getComments = async (params: GetComments, baseUrl: string) : Promise<(void | GetCommentsResponse)> => {
    const data = await fetch(`/api/getComments?post_id=${params.post_id}&sort=${params.sort}&limit=${params.limit}&page=${params.page}&max_depth=${params.max_depth}&baseUrl=${baseUrl}&type_=All&auth=${params.auth}`).then(res => res.json());
    if(!data?.comments) {
        return console.warn("Something went wrong getting the comments");
    }
    return data;
}

export const subscribeToCommunity = async (params: FollowCommunity) : Promise<CommentResponse> => {
    const data = await fetch(`/api/subscribeToCommunity`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ community_id: params.community_id, follow: params.follow, auth: params.auth })
    }).then(res => res.json());
    console.log(data);
    return data;
}

export const search = async (params: Search) : Promise<(void | SearchResponse)> => {
    const data = await fetch(`/api/search?q=${params.q}&type_=${params.type_}&auth=${params.auth}&listing_type=${params.listing_type}`).then(res => res.json());
    if(!data) {
        return console.warn("Something went wrong searching");
    }
    return data;

}