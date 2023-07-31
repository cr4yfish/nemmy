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
        className=" absolute left-0 top-0 flex h-full w-full flex-col gap-4 p-6 overflow-y-auto
             backdrop-blur-3xl
             dark:bg-neutral-950/50 
             prose dark:prose-invert prose-headings:my-1
             "
        style={{ zIndex: 1000, WebkitOverflowScrolling: "touch", touchAction: "auto" }}
      >
        <button onClick={() => handleClose()}>
          <span className="material-symbols-outlined">close</span>
        </button>
        <div>
          <h1 className=" capitalize">{new URL(siteResponse.site_view.site.actor_id).host}</h1>
          <RenderMarkdown content={siteResponse.site_view.site.description} />
        </div>
        <RenderMarkdown content={siteResponse.site_view.site.sidebar} />
      </motion.div>
    </>
  );
}
