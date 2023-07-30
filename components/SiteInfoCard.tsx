import { GetSiteResponse } from "lemmy-js-client";

import RenderMarkdown from "./ui/RenderMarkdown";

import { FormatNumber } from "@/utils/helpers";

function Snack({ text, icon }: { text?: string; icon?: string }) {
  return (
    <div className="flex flex-row items-center gap-1 text-xs">
      <span
        className="material-symbols-outlined h-fit"
        style={{ fontSize: "1rem" }}
      >
        {icon}
      </span>
      <span>{text}</span>
    </div>
  );
}

export default function SiteInfoCard({
  siteResponse,
}: {
  siteResponse: GetSiteResponse | null;
}) {
  const site = siteResponse?.site_view.site;
  const counts = siteResponse?.site_view.counts;

  if (!site) return null;

  return (
    <div
      className=" flex 
        h-fit w-full max-w-xs 
        flex-col gap-2 p-4 dark:rounded-lg dark:border dark:border-neutral-800
        dark:bg-neutral-900 max-lg:hidden

        "
    >
      <div className="flex h-fit w-full flex-col gap-2">
        <span className="text-xl font-bold capitalize">{new URL(site.actor_id).host}</span>
        {site.banner && (
          <img
            className="overflow-hidden 
                    rounded-xl"
            src={site?.banner}
            alt=""
          />
        )}
      </div>

      <div className="flex w-full flex-row flex-wrap items-center gap-2 rounded-lg border-neutral-700 p-2 dark:border">
        {counts?.users && (
          <Snack
            text={FormatNumber(counts.users, true).toString()}
            icon="people"
          />
        )}
        {counts?.users && (
          <Snack
            text={FormatNumber(counts.communities, true).toString()}
            icon="communities"
          />
        )}
        {counts?.users && (
          <Snack
            text={FormatNumber(counts.posts, true).toString()}
            icon="edit"
          />
        )}
      </div>

      <RenderMarkdown className="w-full text-xs" content={site?.sidebar} />
    </div>
  );
}
