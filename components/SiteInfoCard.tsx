import { GetSiteResponse } from "lemmy-js-client";

import RenderMarkdown from "./ui/RenderMarkdown";

import { FormatNumber } from "@/utils/helpers";
import Username from "./User/Username";

function Snack({ text, icon }: { text?: string; icon?: string }) {
  return (
    <div className="flex flex-row items-center gap-1 text-xs text-neutral-700 dark:text-neutral-400">
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
      className=" card flex flex-col max-lg:hidden
        h-fit w-full max-w-xs gap-4
        "
    >
      <div className="flex h-fit w-full flex-col gap-2 prose dark:prose-invert prose-headings:mb-0">
        <h1 className="capitalize">{new URL(site.actor_id).host}</h1>
        <span className="text-sm">{site?.description}</span>
        {site.banner && ( <img  className="overflow-hidden mt-0 rounded-xl" src={site?.banner}  alt="" /> )}
      </div>

      <div className="flex w-full flex-row flex-wrap items-center gap-2 rounded-lg border-neutral-700 p-2 dark:border">
        {counts?.users && (
          <Snack
            text={FormatNumber(counts.users, true).toString()}
            icon="people"
          />
        )}
        {counts?.communities && (
          <Snack
            text={FormatNumber(counts.communities, true).toString()}
            icon="communities"
          />
        )}
        {counts?.posts && (
          <Snack
            text={FormatNumber(counts.posts, true).toString()}
            icon="edit"
          />
        )}
        {counts?.posts && (
          <Snack
            text={siteResponse.version.split("-")[0]}
            icon="update"
          />
        )}
      </div>

      <div className="flex flex-col gap-1">
        <span className="prose dark:prose-invert font-bold">Instance Admins</span>
        <div className="flex flex-row flex-wrap gap-2">
          {siteResponse.admins.map((admin) => (
            <Username key={admin.person.id} user={admin.person} baseUrl={new URL(site.actor_id).host} />
          ))}          
        </div>
      </div>

      <div className="flex flex-col">
        <span className="prose dark:prose-invert font-bold">Instance Sidebar</span>
        <RenderMarkdown className="w-full text-xs" content={site?.sidebar} />
      </div>

    </div>
  );
}
