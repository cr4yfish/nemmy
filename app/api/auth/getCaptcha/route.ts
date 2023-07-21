import { LemmyHttp, Login, GetCaptcha} from "lemmy-js-client"
import { DEFAULT_INSTANCE } from "@/constants/settings";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const auth = body.auth, instance = body.instance ? `https://${body.instance}` : DEFAULT_INSTANCE;
        const client = new LemmyHttp(instance);

        const response = await client.getCaptcha();
        return new Response(JSON.stringify({ response }), { status: 200, headers: { 'Content-Type': 'application/json' } })

    } catch (e: any) {
        console.error(e);
        return new Response(JSON.stringify({ error: e }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}