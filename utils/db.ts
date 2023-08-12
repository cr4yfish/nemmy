import { PollDb } from "@/components/Poll";


export async function votePoll(poll: PollDb) {
    const res = await fetch("/api/poll", {
        method: "POST",
        body: JSON.stringify(poll), 
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .catch(e => console.error(e))
    .finally(() => console.log("votePoll done"));
}

function replaceLastChar(str: string, replacement: string) {
    const lastIndex = str.lastIndexOf('}');
    if (lastIndex === -1) {
      return str;
    }
    return str.slice(0, lastIndex) + replacement;
}


export async function getPollData(id: number, instance: string): Promise<PollDb | undefined> {
    const res = await fetch(`/api/poll?id=${id}&instance=${instance}`)
    const body = (await res.json()).rows[0];
    console.log(body)
    if(body) {
        console.log("Poll data:", body)
        let vals = body.values as unknown as string;
        vals = vals.replace("{", "[")
        vals = replaceLastChar(vals, "]");
        console.log("Parsed values:",JSON.parse(vals));

        let valsArray: Array<any> = JSON.parse(vals).map((v: any) => JSON.parse(v));
        console.log("Parsed values array:", valsArray);   
        return {
            id: body.id,
            instance: body.instance,
            values: valsArray,
            title: body.title
        }
    }
}