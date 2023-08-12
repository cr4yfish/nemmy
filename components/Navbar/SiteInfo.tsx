import { GetSiteResponse } from "lemmy-js-client";
import { motion } from "framer-motion";
import { disablePageScroll, enablePageScroll } from "scroll-lock";

import RenderMarkdown from "../ui/RenderMarkdown";
import { useEffect } from "react";

import Username from "../User/Username";
import Snack from "../ui/Snack";

import { FormatNumber } from "@/utils/helpers";

export default function SiteInfo({
  siteResponse,
  close,
}: {
  siteResponse: GetSiteResponse;
  close: Function;
}) {
  useEffect(() => {
    disablePageScroll();
  }, []);

  const handleClose = () => {
    enablePageScroll();
    close();
  };

  const site = siteResponse?.site_view.site;
  const counts = siteResponse?.site_view.counts;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        id="siteInfo"
        className=" prose fixed left-0 top-0 flex h-full w-full min-w-full flex-col gap-4 overflow-y-auto
             p-6
             backdrop-blur-3xl 
             dark:prose-invert prose-headings:my-1 prose-img:my-0
             dark:bg-neutral-950/50
             "
        style={{
          zIndex: 1000,
          WebkitOverflowScrolling: "touch",
          touchAction: "auto",
        }}
      >
        <button onClick={() => handleClose()}>
          <span className="material-symbols-outlined">close</span>
        </button>
        <div
          className=" card flex h-fit w-full flex-col gap-2
                "
        >
          <div className="prose flex h-fit w-full flex-col gap-2 dark:prose-invert prose-headings:mb-0 prose-img:my-2">
            <h1 className="capitalize">{new URL(site.actor_id).host}</h1>
            <span className="text-sm">{site?.description}</span>
            {site.banner && (
              <img
                className="mt-0 overflow-hidden rounded-xl"
                src={site?.banner}
                alt=""
              />
            )}
          </div>

          <div className="flex w-fit flex-row flex-wrap items-center gap-2 rounded-lg border-neutral-700 p-2 dark:border">
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
            <span className="prose font-bold dark:prose-invert prose-img:mt-0">
              Instance Admins
            </span>
            <div className="flex flex-row flex-wrap gap-2">
              {siteResponse.admins.map((admin) => (
                <Username
                  key={admin.person.id}
                  user={admin.person}
                  instance={new URL(site.actor_id).host}
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
              content={site?.sidebar}
            />
          </div>
        </div>
      </motion.div>
    </>
  );
}
