
declare module "lemmy-types" {
    interface PostView {
        post: Post;
        creator: User;
        community: Community;
        creator_banned_from_community: boolean;
        counts: Counts;
        subscribed: string;
        saved: boolean;
        read: boolean;
        creator_blocked: boolean;
        unread_comments: number;
    }

    interface Post {
        id: number;
        name: string;
        url: string;
        creator_id: number;
        community_id: number;
        removed: boolean;
        locked: boolean;
        published: string;
        deleted: boolean;
        nsfw: boolean;
        ap_id: string;
        local: boolean;
        language_id: number;
        featured_community: boolean;
        featured_local: boolean;
    }

    interface User {
        id: number;
        name: string;
        display_name: string;
        avatar: string;
        banned: boolean;
        published: string;
        actor_id: string;
        bio: string;
        local: boolean;
        banner: string;
        deleted: boolean;
        admin: boolean;
        bot_account: boolean;
        instance_id: number;
    }

    interface Community {
        id: number;
        name: string;
        title: string;
        description: string;
        removed: boolean;
        published: string;
        updated: string;
        deleted: boolean;
        nsfw: boolean;
        actor_id: string;
        local: boolean;
        icon: string;
        hidden: boolean;
        posting_restricted_to_mods: boolean;
        instance_id: number;
    }
     
    interface Counts {
        id: number;
        post_id: number;
        comments: number;
        score: number;
        upvotes: number;
        downvotes: number;
        published: string;
        newest_comment_time_necro: string;
        newest_comment_time: string;
        featured_community: boolean;
        featured_local: boolean;
        hot_rank: number;
        hot_rank_active: number;
    }
}