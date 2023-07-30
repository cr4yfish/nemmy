import { GetSiteResponse } from "lemmy-js-client";
import { motion } from "framer-motion";
import { disablePageScroll, enablePageScroll } from "scroll-lock";

import RenderMarkdown from "../ui/RenderMarkdown";
import { useEffect } from "react";

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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        id="siteInfo"
        className=" absolute left-0 top-0 flex h-full w-full flex-col gap-4 p-6
             backdrop-blur-3xl
             dark:bg-neutral-950/50 "
        style={{ zIndex: 1000 }}
      >
        <button onClick={() => handleClose()}>
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex w-fit flex-col gap-0 rounded-lg p-4 dark:bg-neutral-900">
          <span className="text-xs font-bold">Your Instance</span>
          <span>{new URL(siteResponse.site_view.site.actor_id).host}</span>
        </div>
        <div>
          <span className="text-xl italic">
            <RenderMarkdown content={siteResponse.site_view.site.description} />
          </span>
          <RenderMarkdown content={siteResponse.site_view.site.sidebar} />
        </div>
      </motion.div>
    </>
  );
}
