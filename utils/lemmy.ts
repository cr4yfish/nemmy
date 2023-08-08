import {
  CommentResponse,
  CommentView,
  CreateComment,
  CreatePost,
  FollowCommunity,
  GetComments,
  GetCommentsResponse,
  GetPostResponse,
  GetSiteResponse,
  ListCommunities,
  ListCommunitiesResponse,
  PostResponse,
  Register,
  Search,
  SearchResponse,
  LoginResponse,
  GetCaptcha,
  GetFederatedInstances,
  GetFederatedInstancesResponse,
  GetCaptchaResponse,
  GetPosts,
  GetPostsResponse,
  GetReplies,
  GetRepliesResponse,
  GetUnreadCount,
  GetUnreadCountResponse,
  CreateCommunity,
  CommunityResponse,
  Community,
  SaveUserSettings,
  SavePost,
  SaveComment,
  PostView,
  CommunityView,
} from "lemmy-js-client";
import { cache } from "react";
import { AccountWithSiteResponse } from "./authFunctions";

export const getUserDetails = cache(
  async (jwt: string, baseUrl: string): Promise<GetSiteResponse> => {
    const user: GetSiteResponse = await fetch(
      `/api/getSite?auth=${jwt}&baseUrl=${baseUrl}`,
    ).then((res) => res.json());
    return user as GetSiteResponse;
  },
);

export const listCommunities = cache(
  async (
    params: ListCommunities,
    instance?: string,
  ): Promise<boolean | ListCommunitiesResponse> => {
    const communities: ListCommunitiesResponse = await fetch(
      `/api/listCommunities?auth=${params.auth}&type_=${params.type_}&sort=${params.sort}&page=${params.page}&instance=${instance}`,
    ).then((res) => res.json());
    if (!communities.communities) {
      console.warn("Could not retrieve communities");
      return false;
    }
    return communities as ListCommunitiesResponse;
  },
);

export const getPosts = cache(
  async (
    params: GetPosts,
    instance?: string,
  ): Promise<boolean | PostView[]> => {
    const posts: PostView[] = await fetch(
      `/api/getPosts?auth=${params.auth}&type_=${params.type_}&sort=${params.sort}&page=${params.page}&limit=${params.limit}&instance=${instance}&saved_only=${params.saved_only}`,
    ).then((res) => res.json());
    if (!posts) {
      console.warn("Could not retrieve posts");
      return false;
    }
    return posts;
  },
);

export const getTrendingCommunities = cache(
  async (instance?: string): Promise<boolean | CommunityView[]> => {
    const communities: ListCommunitiesResponse = await fetch(
      `/api/listCommunities?type_=All&sort=TopTwelveHour&limit=3&instance=${instance}`,
    ).then((res) => res.json());
    if (!communities.communities) {
      console.warn("Could not retrieve communities");
      return false;
    }
    return communities.communities.slice(0, 3);
  },
);

export const getTrendingTopics = cache(
  async (instance?: string): Promise<boolean | PostView[]> => {
    const posts: PostView[] = await fetch(
      `/api/getPosts?type_=All&sort=TopTwelveHour&limit=3&instance=${instance}`,
    ).then((res) => res.json());
    if (!posts) {
      console.warn("Could not retrieve posts");
      return false;
    }
    return posts.slice(0, 3);
  },
);

export const createPost = async (
  params: CreatePost,
): Promise<boolean | PostResponse> => {
  const response = await fetch(`/api/createPost`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  if (!response?.post_view.post?.id) {
    console.warn("Could not create post");
    return false;
  }
  return response as PostResponse;
};

export const createCommunity = async (
  params: CreateCommunity,
  instance: string,
): Promise<boolean | CommunityResponse> => {
  const response = await fetch("/api/createCommunity", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...params,
      instance,
    }),
  }).then((res) => res.json());
  if (!response?.community_view.community?.id) {
    console.warn("Could not create community");
    return false;
  }
  return response as CommunityResponse;
};

export const sendComment = async (params: CreateComment) => {
  const data: CommentResponse = await fetch(`/api/createComment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: params.content,
      auth: params.auth,
      post_id: params.post_id,
      parent_id: params.parent_id,
    }),
  }).then((res) => res.json());

  if (!data?.comment_view?.comment?.id)
    return alert("Something went wrong sending the comment");

  return data.comment_view;
};

export const getComments = cache(
  async (
    params: GetComments,
    baseUrl: string,
  ): Promise<void | GetCommentsResponse> => {
    try {
      const data = await fetch(
        `/api/getComments?post_id=${params.post_id}&sort=${params.sort}&limit=${params.limit}&page=${params.page}&max_depth=${params.max_depth}&parent_id=${params.parent_id}&baseUrl=${baseUrl}&type_=All&auth=${params.auth}`,
      ).then((res) => res.json());
      if (!data?.comments) {
        return console.warn("Something went wrong getting the comments");
      }
      return data;
    } catch (err) {
      console.warn(err);
    }
  },
);

export const getCommentChildren = cache(
  async (
    params: GetComments,
    baseUrl: string,
  ): Promise<void | GetCommentsResponse> => {
    try {
      const data = await fetch(
        `/api/getComments?post_id=${params.post_id}&parent_id=${params.parent_id}&sort=Top&page=1&auth=${params.auth}`,
      ).then((res) => res.json());
      if (!data?.comments) {
        return console.warn("Something went wrong getting the comments");
      }
      return data;
    } catch (err) {
      console.warn(err);
    }
  },
);

/**
 * Contrary to the name, this can also unfollow a community
 * @param params
 * @returns
 */
export const subscribeToCommunity = async (
  params: FollowCommunity,
  instance: string,
): Promise<CommentResponse> => {
  const data = await fetch("/api/subscribeCommunity", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      community_id: params.community_id,
      follow: params.follow,
      auth: params.auth,
      instance: instance,
    }),
  }).then((res) => res.json());
  return data;
};

export const search = cache(
  async (params: Search): Promise<void | SearchResponse> => {
    const data = await fetch(
      `/api/search?q=${params.q}&type_=${params.type_}&auth=${params.auth}&listing_type=${params.listing_type}`,
    ).then((res) => res.json());
    if (!data) {
      return console.warn("Something went wrong searching");
    }
    return data;
  },
);

export const register = async (
  params: Register,
  instance: string,
): Promise<void | LoginResponse> => {
  const data = await fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: params.username,
      password: params.password,
      password_verify: params.password_verify,
      show_nsfw: params.show_nsfw,
      email: params.email,
      instance: instance,
      captcha_uuid: params.captcha_uuid,
      captcha_answer: params.captcha_answer,
    }),
  }).then((res) => res.json());
  return data.register;
};

export const getCaptcha = async (
  params: GetCaptcha,
  instance: string,
): Promise<void | GetCaptchaResponse> => {
  const data = await fetch("/api/auth/getCaptcha", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth: params.auth,
      instance: instance,
    }),
  }).then((res) => res.json());
  return data.response;
};

export const getFederatedInstances = cache(
  async (
    params?: GetFederatedInstances,
    instance?: string,
  ): Promise<void | GetFederatedInstancesResponse> => {
    const data = await fetch(
      `/api/getFederatedInstances?auth=${params?.auth}&instance=${instance}`,
    ).then((res) => res.json());
    return data;
  },
);

export const getCuratedInstances = cache(async () => {
  const data = await fetch("/api/getCuratedInstances").then((res) =>
    res.json(),
  );
  return data;
});

export const getReplies = cache(
  async (
    params: GetReplies,
    instance: string,
  ): Promise<void | GetRepliesResponse> => {
    const data = await fetch(
      `/api/getReplies?auth=${params.auth}&sort=${params.sort}&page=${params.page}&unread_only=${params.unread_only}&instance=${instance}`,
    ).then((res) => res.json());
    return data;
  },
);

export const getUnreadCount = cache(
  async (
    params: GetUnreadCount,
    instance?: string,
  ): Promise<void | GetUnreadCountResponse> => {
    const data = await fetch(
      `/api/getUnreadCount?auth=${params.auth}&instance=${instance}`,
    ).then((res) => res.json());
    return data;
  },
);

export const saveUserSettings = async (
  params: SaveUserSettings,
  instance: string,
): Promise<void | LoginResponse> => {
  const data = await fetch("/api/saveUserSettings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...params, instance }),
  }).then((res) => res.json());
  return data;
};

export const getUserSettings = cache(
  (accountWithSite: AccountWithSiteResponse) => {
    const localUser = accountWithSite.site.my_user?.local_user_view.local_user;
    const person = accountWithSite.user.person;
    const settings: SaveUserSettings = {
      show_nsfw: localUser?.show_nsfw,
      show_scores: localUser?.show_scores,
      theme: localUser?.theme,
      default_sort_type: localUser?.default_sort_type,
      default_listing_type: localUser?.default_listing_type,
      interface_language: localUser?.interface_language,
      avatar: person?.avatar,
      banner: person?.banner,
      display_name: person?.display_name,
      email: localUser?.email,
      bio: person?.bio,
      matrix_user_id: person?.matrix_user_id,
      show_avatars: localUser?.show_avatars,
      send_notifications_to_email: localUser?.send_notifications_to_email,
      bot_account: person?.bot_account,
      show_bot_accounts: localUser?.show_bot_accounts,
      show_read_posts: localUser?.show_read_posts,
      show_new_post_notifs: localUser?.show_new_post_notifs,
      discussion_languages: [],
      generate_totp_2fa: false, // not recommended currently
      auth: accountWithSite.jwt,
    };
    return settings;
  },
);

/**
 * Saves a post
 * @param params
 * @param instance
 * @returns
 */
export async function savePost(params: SavePost, instance: string) {
  const data = await fetch("/api/savePost", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...params, instance }),
  }).then((res) => res.json());
  return data as PostResponse;
}

/**
 * Saves a comment
 * @param params
 * @param instance
 * @returns
 */
export async function saveComment(params: SaveComment, instance?: string) {
  const data = await fetch("/api/saveComment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...params, instance }),
  }).then((res) => res.json());
  return data as CommentResponse;
}
