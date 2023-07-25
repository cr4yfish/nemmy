"use client";

import { useState } from "react";
import { ClipLoader } from "react-spinners";

import { Account, getUserDataFromLocalStorage } from "@/utils/authFunctions";
import { saveUserSettings, getUserSettings } from "@/utils/lemmy";
import { getBlobFromFile } from "@/utils/helpers";


import Input from "../ui/Input";

function Section({ children, title }: { children: any, title: string }) {
    return (
        <>
        <div className=" w-full flex flex-col gap-2" >
            <span className=" w-full font-bold text-xs">{title}</span>
            <div className="flex flex-col w-full bg-neutral-200 dark:bg-neutral-800 rounded-lg p-6">{children}</div>
        </div>
        </>
    )
}

export default function SettingsPage({ currentAccount } : { currentAccount: Account }) {
    const [loading, setLoading] = useState<boolean>(false);
    const [avatar, setAvatar] = useState<File | null>(null);

    const saveUserAvatar = async () => {
        if(!avatar) return;
        setLoading(true)
        const blob = await getBlobFromFile(avatar);
        const url = URL.createObjectURL(blob);
        console.log(url)

        // Currently there's a bug in Lemmy that doesn't 
        // allow you to save settings if you don't have all the other settings
        // get rest of user settings
        // See https://github.com/LemmyNet/lemmy/issues/3565
            const accountWithSiteData = getUserDataFromLocalStorage(currentAccount);
            if(!accountWithSiteData) return; // Need this to be able to save settings

            let settings = getUserSettings(accountWithSiteData);
            if(!settings) return; // Need this as well

            // save avatar to settings
            settings.avatar = url;

        const response = await saveUserSettings(
            settings,
            currentAccount.instance
        );

        // remove the blob from memory
        //URL.revokeObjectURL(url);

        console.log(response);
        setLoading(false);
    }

    return (
        <>
        <div className="h-full w-full p-20 max-sm:p-4 flex flex-col gap-8 overflow-y-hidden">
            <Section title="Change User Avatar">
                <Input 
                    type="file" 
                    onChange={(e: File[]) => setAvatar(e[0])} 
                    right={loading ? <ClipLoader size={20} color={"#e6b0fa"} /> : null}
                    isLoading={loading}
                />

                <span>{avatar?.name}</span>

                <button onClick={() => saveUserAvatar()} className=" a">Send</button>
                
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