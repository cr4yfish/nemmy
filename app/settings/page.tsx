import { GetSiteResponse, LemmyHttp } from "lemmy-js-client";
import { cookies } from "next/dist/client/components/headers";

import { DEFAULT_INSTANCE } from "@/constants/settings";

import { getCurrentAccountServerSide } from "@/utils/authFunctions";

function Section({ children, title }: { children: any, title: string }) {

    return (
        <>
        <div className=" w-full" >
            <span className=" w-full">{title}</span>
            <div className="flex flex-col w-full bg-fuchsia-200 dark:bg-neutral-800 rounded-lg p-6">{children}</div>
        </div>
        </>
    )
}

async function getUserData (username: string, jwt?: string, instance?: string): Promise<GetSiteResponse> {
    const client: LemmyHttp = new LemmyHttp(instance ? `https://${instance}` : DEFAULT_INSTANCE);

    const user = await client.getSite({
        auth: jwt as unknown as string,
    })
    return user;
}

export default async function Settings() {
    const cookieStore = cookies();
    const currentAccount = getCurrentAccountServerSide(cookieStore);

    return (
        <>
        <div className="h-full max-w-3xl flex flex-col overflow-y-hidden">
            <Section title="Default instance">
                
            </Section>
            <Section title="Appearance">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-row justify-between w-full">
                        <span>Modern</span>
                        <span>Compact</span>
                    </div>
                    <div>Use system theme</div>
                </div>
            </Section>

            <Section title="Textsize">
                <div className="flex flex-col gap-4">
                    <div>Small</div>
                    <div>Regular</div>
                    <div>Big</div>
                </div>
            </Section>
        </div>
        </>
    )
}