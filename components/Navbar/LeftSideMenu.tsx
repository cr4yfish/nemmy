"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useSession } from "@/hooks/auth";
import { DEFAULT_INSTANCE, DEFAULT_AVATAR } from "@/constants/settings";
import Input from "../ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { disablePageScroll, enablePageScroll } from "scroll-lock";

import SiteInfo from "./SiteInfo";

import styles from "@/styles/components/Navbar/LeftSideMenu.module.css";
import Image from "next/image";

export default function LeftSideMenu({
  handleMenuClose,
  setCommunitySearch,
  communitySearch,
}: {
  handleMenuClose: any;
  setCommunitySearch: any;
  communitySearch: any;
}) {
  const { session } = useSession();
  const [showSiteInfo, setShowSiteInfo] = useState(false);

  useEffect(() => {
    disablePageScroll();
  }, []);

  const handleClose = () => {
    enablePageScroll();
    handleMenuClose();
  };

  return (
    <>
      <AnimatePresence>
        {showSiteInfo && session.siteResponse && (
          <SiteInfo
            siteResponse={session.siteResponse}
            close={() => setShowSiteInfo(false)}
          />
        )}
      </AnimatePresence>
      <motion.div
        id="menu"
        className={`${styles.menu} overflow-y-auto`}
        initial={{ opacity: 0, x: -300 }}
        animate={{ opacity: 1, x: 0, transition: { bounce: 0 } }}
        exit={{ opacity: 0, x: -300 }}
      >
        <div className={`relative flex h-fit flex-col gap-6 `}>
          <button
            className={`${styles.currentInstance}`}
            onClick={() => setShowSiteInfo(true)}
          >
            <div className="flex flex-col items-start justify-start">
              <span className=" text-xs font-bold uppercase dark:text-fuchsia-300">
                Current Instance
              </span>
              <span className="font-bold ">
                {session.currentAccount?.instance ||
                  new URL(DEFAULT_INSTANCE).host}
              </span>
            </div>

            <span className="material-symbols-outlined">expand_content</span>
          </button>

          <div className={`${styles.menuLinks}`}>
            <Link onClick={() => handleClose()} href={"/"}>
              <button>
                <span className="material-symbols-outlined">home</span>Home
              </button>
            </Link>
          </div>
        </div>

        <div className={`flex flex-col gap-2`}>
          <div className="flex items-center justify-between gap-1">
            <span className="font-bold">Communities</span>
            <span className="material-symbols-outlined">arrow_drop_down</span>
          </div>

          {session.currentAccount ? (
            <>
              <div className="flex">
                <Input
                  onChange={(e: any) =>
                    setCommunitySearch(e.currentTarget.value)
                  }
                  type="text"
                  label=""
                  name="searchCommunities"
                  placeholder="Search Communities"
                />
              </div>

              <div className={`relative flex flex-col gap-4 overflow-y-auto`}>
                {session?.siteResponse?.my_user?.follows
                  ?.filter((c) => c.community.name.includes(communitySearch))
                  .map((community, index) => (
                    <div key={index}>
                      <Link
                        href={`/c/${community.community.name}@${
                          new URL(community.community.actor_id).host
                        }`}
                        onClick={() => handleClose()}
                        className={`${styles.menuCommunity}`}
                      >
                        <Image
                          height={40}
                          width={40}
                          className="h-10 w-10 overflow-hidden rounded-full"
                          src={community?.community?.icon || DEFAULT_AVATAR}
                          alt=""
                        />
                        <span className=" capitalize ">
                          {community.community.name}
                        </span>
                      </Link>
                    </div>
                  ))}
              </div>
            </>
          ) : (
            <div
              key={"scrollerend"}
              className=" mb-24 mt-24 flex w-full flex-col items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-blue-400">
                info
              </span>
              <span className=" flex w-full flex-wrap items-center justify-center gap-1">
                <Link href={"/auth"} className="a">
                  Log in
                </Link>{" "}
                to view your communities
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
