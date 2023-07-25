import { LemmyHttp, PostId, CommentId } from "lemmy-js-client"
import { DEFAULT_INSTANCE } from "@/constants/settings";

export async function POST(req: Request) {
    try {

        const body = await req.json();

        // Regards to github copilot for this snippet
        let show_nsfw = body.show_nsfw;
        let show_scores = body.show_scores;
        let theme = body.theme;
        let default_sort_type = body.default_sort_type;
        let default_listing_type = body.default_listing_type;
        let interface_language = body.interface_language;
        let avatar = body.avatar;
        let banner = body.banner;
        let display_name = body.display_name;
        let email = body.email;
        let bio = body.bio;
        let matrix_user_id = body.matrix_user_id;
        let show_avatars = body.show_avatars;
        let send_notifications_to_email = body.send_notifications_to_email;
        let bot_account = body.bot_account;
        let show_bot_accounts = body.show_bot_accounts;
        let show_read_posts = body.show_read_posts;
        let show_new_post_notifs = body.show_new_post_notifs;
        let discussion_languages = body.discussion_languages;
        let generate_totp_2fa = body.generate_totp_2fa;
        let auth = body.auth;

        let instance = body.instance;

        if(!auth) throw new Error("missing required parameters");

        let client: LemmyHttp = new LemmyHttp(instance ? `https://${instance}` : DEFAULT_INSTANCE);

        
        let response = await client.saveUserSettings({
            avatar: avatar,
            auth: auth,
            banner: banner,
            bio: bio,
            bot_account: bot_account,
            default_listing_type: default_listing_type,
            default_sort_type: default_sort_type,
            display_name: display_name,
            discussion_languages: discussion_languages,
            email: email,
            generate_totp_2fa: generate_totp_2fa,
            interface_language: interface_language,
            matrix_user_id: matrix_user_id,
            send_notifications_to_email: send_notifications_to_email,
            show_avatars: show_avatars,
            show_bot_accounts: show_bot_accounts,
            show_nsfw: show_nsfw,
            show_read_posts: show_read_posts,
            show_scores: show_scores,
            show_new_post_notifs: show_new_post_notifs,
            theme: theme
        })

        return new Response(JSON.stringify(response), { status: 200, headers: { 'Content-Type': 'application/json' } })

    } catch (e: any) {
        console.error("saveUserSettings Error:", e);
        return new Response(JSON.stringify({ error: e }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}