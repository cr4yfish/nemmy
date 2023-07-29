import { GetSiteResponse } from "lemmy-js-client";
import { motion } from "framer-motion";
import { disablePageScroll, enablePageScroll } from "scroll-lock";

import RenderMarkdown from "../ui/RenderMarkdown";
import { useEffect } from "react";

export default function SiteInfo({ siteResponse, close} : { siteResponse: GetSiteResponse, close: Function }) {

    useEffect(() => {
        disablePageScroll();
    }, [])

    const handleClose = () => {
        enablePageScroll();
        close();
    }

    return (
        <>
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            id="siteInfo"
            className=" absolute top-0 left-0 flex flex-col gap-4 w-full h-full p-6
             backdrop-blur-3xl
             dark:bg-neutral-950/50 "
            style={{ zIndex: 1000 }}
            >
            <button onClick={() => handleClose()}><span className="material-symbols-outlined">close</span></button>
            <div className="flex flex-col gap-0 dark:bg-neutral-900 p-4 rounded-lg w-fit" >
                <span className="font-bold text-xs">Your Instance</span>
                <span>{new URL(siteResponse.site_view.site.actor_id).host}</span>
            </div>
            <div>
                <span className="italic text-xl"><RenderMarkdown content={siteResponse.site_view.site.description} /></span>
                <RenderMarkdown content={siteResponse.site_view.site.sidebar} />
            </div>
        </motion.div>
        </>
    )

}
