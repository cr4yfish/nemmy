import { parse } from "papaparse";

export async function GET(req: Request) {
    try {
        const url_to_csv = "https://raw.githubusercontent.com/maltfield/awesome-lemmy-instances/main/awesome-lemmy-instances.csv";

        const data = parse(await (await fetch(url_to_csv)).text(), { header: true }).data;
        

        return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } })

    } catch (e: any) {
        console.error(e);
        return new Response(JSON.stringify({ error: e }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}