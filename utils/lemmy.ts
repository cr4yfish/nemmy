import { deleteCookie } from "cookies-next";
import { CreatePost, GetSiteResponse, ListCommunities, ListCommunitiesResponse, PostResponse } from "lemmy-js-client"

export const getUserDetails = async (jwt: string) :  Promise<(boolean | GetSiteResponse)> => {
    const user: GetSiteResponse = await fetch(`/api/getSite?auth=${jwt}`).then(res => res.json());
    if(!user.my_user) {
        console.warn("user.my_user is null -> JWT is invalid");
        sessionStorage.removeItem("jwt");
        deleteCookie("jwt");
        return false;
    }
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