import { LemmyHttp, Login} from "lemmy-js-client"
import { DEFAULT_INSTANCE } from "@/constants/settings";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const username = body.username, password = body.password, email = body.email, show_nsfw = body.show_nsfw, instance = body.instance ? `https://${body.instance}` : DEFAULT_INSTANCE,
        captcha_uuid = body.captcha_uuid, captcha_answer = body.captcha_answer, honeypot = body.honeypot, answer = body.answer;

        const client = new LemmyHttp(instance);

        console.log(username, password, email, show_nsfw, instance);

        const register = await client.register({ username, password, password_verify: password, email, show_nsfw: show_nsfw, captcha_uuid, captcha_answer, honeypot, answer });

        return new Response(JSON.stringify({ register }), { status: 200, headers: { 'Content-Type': 'application/json' } })

    } catch (e: any) {
        console.error(e);
        return new Response(JSON.stringify({ error: e }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}