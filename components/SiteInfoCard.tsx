import { GetSiteResponse } from "lemmy-js-client";

import RenderMarkdown from "./ui/RenderMarkdown";

import { FormatNumber } from "@/utils/helpers";
import Username from "./User/Username";
import Snack from "./ui/Snack";

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
      className=" card flex h-fit w-full max-w-xs flex-col gap-4
        bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 max-lg:hidden
        "
    >
      <div className="prose flex h-fit w-full flex-col gap-2 dark:prose-invert prose-headings:mb-0">
        <span className=" text-lg  font-bold capitalize">
          {new URL(site.actor_id).host}
        </span>
        <span className="text-sm">{site?.description}</span>
        {site.banner && (
          <img
            className="mt-0 overflow-hidden rounded-xl"
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
          <Snack text={siteResponse.version.split("-")[0]} icon="update" />
        )}
      </div>

      <div className="flex flex-col gap-1">
        <span className="prose font-bold dark:prose-invert">
          Instance Admins
        </span>
        <div className="flex flex-row flex-wrap gap-2">
          {siteResponse.admins.map((admin) => (
            <Username
              key={admin.person.id}
              user={admin.person}
              baseUrl={new URL(site.actor_id).host}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        <span className="prose font-bold dark:prose-invert">
          Instance Sidebar
        </span>
        <RenderMarkdown className="w-full text-xs" content={site?.sidebar} />
      </div>
    </div>
  );
}
