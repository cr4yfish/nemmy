import { GetSiteResponse } from "lemmy-js-client";

import RenderMarkdown from "./ui/RenderMarkdown";

import { FormatNumber } from "@/utils/helpers";

function Snack({text, icon} : { text?: string, icon?: string }) {

    return (
        <div className="flex flex-row gap-1 items-center text-xs" >
            <span className="material-symbols-outlined h-fit" style={{ fontSize: "1rem" }}>{icon}</span>
            <span>{text}</span>
        </div>
    )
}

export default function SiteInfoCard({ siteResponse} : { siteResponse: GetSiteResponse | null }) {

    const site = siteResponse?.site_view.site;
    const counts = siteResponse?.site_view.counts;

    if(!site) return null;

    return (
        <div className=" dark:bg-neutral-900 
        dark:rounded-lg dark:border dark:border-neutral-800 
        flex flex-col max-w-xs w-full gap-2 p-4
        h-fit max-lg:hidden

        "
        >
            <div className="flex flex-col gap-2 w-full h-fit">
                <span className="font-bold text-xl">{new URL(site.actor_id).host}</span>
                { site.banner &&
                    <img 
                    className="rounded-xl 
                    overflow-hidden" 
                    src={site?.banner} alt="" 
                />
                }
            </div>

            <div className="flex flex-row flex-wrap items-center gap-2 w-full dark:border border-neutral-700 rounded-lg p-2">
                {counts?.users && <Snack text={FormatNumber(counts.users, true).toString()} icon="people" />}
                {counts?.users && <Snack text={FormatNumber(counts.communities, true).toString()} icon="communities" />}
                {counts?.users && <Snack text={FormatNumber(counts.posts, true).toString()} icon="edit" />}
                
            </div>

            <RenderMarkdown className="text-xs w-full" content={site?.sidebar} />

        </div>
    )
}