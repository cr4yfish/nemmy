"use client";

import { GetSiteResponse } from "lemmy-js-client";
import { useState, useEffect } from "react";

import RenderMarkdown from "./ui/RenderMarkdown";

import { useSession } from "@/hooks/auth";

import { FormatNumber } from "@/utils/helpers";
import { getUserDataFromLocalStorage } from "@/utils/authFunctions";
import Username from "./User/Username";
import Snack from "./ui/Snack";

export default function SiteInfoCard({
  siteResponse,
}: {
  siteResponse: GetSiteResponse | null;
}) {
  const { session } = useSession();

  const [site, setSite] = useState(siteResponse);

  useEffect(() => {
    if (!session.isLoggedIn) return;
    if (!session.currentAccount?.instanceAccounts) return;

    const newSite = getUserDataFromLocalStorage(
      session.currentAccount.username,
      session.currentAccount.instanceAccounts[0]?.instance,
    );
    if (!newSite) return;
    setSite(newSite);
  }, [session.currentAccount, session.isLoggedIn]);

  if (!site) return null;

  return (
    <div
      className=" card flex h-fit w-full max-w-xs flex-col gap-4
        bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 max-lg:hidden
        "
    >
      <div className="prose flex h-fit w-full flex-col gap-2 dark:prose-invert prose-headings:mb-0">
        <span className=" text-lg  font-bold capitalize">
          {new URL(site.site_view.site.actor_id).host}
        </span>
        <span className="text-sm">{site?.site_view.site.description}</span>
        {site.site_view.site.banner && (
          <img
            className="mt-0 overflow-hidden rounded-xl"
            src={site?.site_view.site.banner}
            alt=""
          />
        )}
      </div>

      <div className="flex w-full flex-row flex-wrap items-center gap-2 rounded-lg border-neutral-700 p-2 dark:border">
        {site.site_view.counts?.users && (
          <Snack
            text={FormatNumber(site.site_view.counts.users, true).toString()}
            icon="people"
          />
        )}
        {site.site_view.counts?.communities && (
          <Snack
            text={FormatNumber(
              site.site_view.counts.communities,
              true,
            ).toString()}
            icon="communities"
          />
        )}
        {site.site_view.counts?.posts && (
          <Snack
            text={FormatNumber(site.site_view.counts.posts, true).toString()}
            icon="edit"
          />
        )}
        {site.site_view.counts?.posts && (
          <Snack text={site.version.split("-")[0]} icon="update" />
        )}
      </div>

      <div className="flex flex-col gap-1">
        <span className="prose font-bold dark:prose-invert">
          Instance Admins
        </span>
        <div className="flex flex-row flex-wrap gap-2">
          {site.admins.map((admin) => (
            <Username
              key={admin.person.id}
              user={admin.person}
              instance={new URL(site.site_view.site.actor_id).host}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        <span className="prose font-bold dark:prose-invert">
          Instance Sidebar
        </span>
        <RenderMarkdown
          className="w-full text-xs"
          content={site?.site_view.site.sidebar}
        />
      </div>
    </div>
  );
}
