"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { disablePageScroll, enablePageScroll } from "scroll-lock";
import Image from "next/image";
import InfiniteScroll from "react-infinite-scroller";

import { useSession } from "@/hooks/auth";

import { DEFAULT_INSTANCE, DEFAULT_AVATAR } from "@/constants/settings";

import Input from "../ui/Input";
import { SmallCommunityCard } from "../ui/CommunityCard";

import { listCommunities } from "@/utils/lemmy";
import { handleClickCommunity, getCommunityId } from "@/utils/helpers";

import SiteInfo from "./SiteInfo";

import styles from "@/styles/components/Navbar/LeftSideMenu.module.css";
import { CommunityView } from "lemmy-js-client";

export default function LeftSideMenu({
  handleMenuClose,
}: {
  handleMenuClose?: any;
}) {
  const { session, setSession } = useSession();
  const [showSiteInfo, setShowSiteInfo] = useState(false);
  const [communities, setCommunities] = useState<CommunityView[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [communitySearch, setCommunitySearch] = useState<string>("");

  const handleClose = () => {
    handleMenuClose();
  };

  const handleLoadMore = async (page: number) => {
    if (!session.isLoggedIn) return;
    const data = await listCommunities(
      {
        page: page,
        auth: session.currentAccount?.instanceAccounts[0]?.jwt,
        type_: "Subscribed",
        sort: "Active",
      },
      session.currentAccount?.instanceAccounts[0]?.instance,
    );
    if (typeof data == "boolean" || data?.communities?.length == 0) {
      setHasMore(false);
      return;
    }

    const oldData = communities;

    const newData = [...oldData, ...data.communities];

    const unique = newData.filter(
      (c, index) =>
        newData.findIndex((c2) => c.community.id == c2.community.id) == index,
    );

    // Sort alphabetically
    const sortedData = unique.sort((a, b) =>
      a.community.name.localeCompare(b.community.name),
    );

    setCommunities(sortedData);
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
        className={`${styles.menu} overflow-y-scroll bg-neutral-50/75 dark:bg-neutral-950/75`}
        initial={{ opacity: 0, x: -300 }}
        animate={{ opacity: 1, x: 0, transition: { bounce: 0 } }}
        exit={{ opacity: 0, x: -300 }}
      >
        <div className={`relative flex h-fit flex-col gap-6 `}>
          <button
            className={`${styles.currentInstance} bg-neutral-300 text-neutral-900 dark:bg-fuchsia-800 dark:text-fuchsia-50`}
            onClick={() => setShowSiteInfo(true)}
          >
            <div className="flex flex-col items-start justify-start">
              <span className=" text-xs font-bold uppercase dark:text-fuchsia-300">
                Current Instance
              </span>
              <span className="font-bold ">
                {session.currentAccount?.instanceAccounts[0]?.instance ||
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

        <div className={`flex h-fit flex-col gap-2`}>
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

              <InfiniteScroll
                pageStart={0}
                hasMore={hasMore}
                loadMore={async (page) => await handleLoadMore(page)}
                className={`relative flex h-fit flex-col gap-2 pb-4`}
              >
                {communities
                  ?.filter((c) => c.community.name.includes(communitySearch))
                  .map((community, index) => (
                    <SmallCommunityCard
                      community={community}
                      session={session}
                      setSession={setSession}
                      key={index}
                    />
                  ))}
              </InfiniteScroll>
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
