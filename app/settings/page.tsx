import { GetSiteResponse, LemmyHttp } from "lemmy-js-client";
import { cookies } from "next/dist/client/components/headers";

import { DEFAULT_INSTANCE } from "@/constants/settings";

import { getCurrentAccountServerSide } from "@/utils/authFunctions";

import SettingsPage from "@/components/PageComponents/SettingsPage";


export default async function Settings() {
    const cookieStore = cookies();
    const currentAccount = getCurrentAccountServerSide(cookieStore);

    if(!currentAccount) {
        return (
            <>
                <div className="h-full w-full p-20 max-sm:p-4 flex flex-col gap-8 overflow-y-hidden">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-row justify-between w-full">
                            <span>Modern</span>
                            <span>Compact</span>
                        </div>
                        <div>Use system theme</div>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <SettingsPage currentAccount={currentAccount} />
        </>
    )
}