"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GetCommunityResponse, SortType } from "lemmy-js-client";
import { ClipLoader } from "react-spinners";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { useNavbar } from "@/hooks/navbar";
import { useSession } from "@/hooks/auth";

import Username from "@/components/User/Username";
import PostList from "@/components/PostList";
import RenderMarkdown from "@/components/ui/RenderMarkdown";
import SortButton from "../ui/SortButton";

import { subscribeToCommunity } from "@/utils/lemmy";
import { FormatNumber } from "@/utils/helpers";

import { DEFAULT_AVATAR, DEFAULT_SORT_TYPE } from "@/constants/settings";

import styles from "@/styles/Pages/CommunityPage.module.css";

export default function CommunityPage({
  initialCommunity,
  communityInstance,
}: {
  initialCommunity: GetCommunityResponse;
  communityInstance: string;
}) {
  const { navbar, setNavbar } = useNavbar();
  const { session } = useSession();
  const [communityData, setCommunityData] =
    useState<GetCommunityResponse>(initialCommunity);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [currentSort, setCurrentSort] = useState<SortType>(DEFAULT_SORT_TYPE);

  const [subscribeLoading, setSubscribeLoading] = useState(false);

  useEffect(() => {
    setNavbar({
      ...navbar!,
      showSort: false,
      showFilter: false,
      showSearch: true,
      showUser: true,
      showback: true,
      titleOverride: `c/${communityData.community_view.community.title}`,
    });
  }, []);

  const subscribe = async () => {
    if (subscribeLoading) return;
    setSubscribeLoading(true);
    if (
      !session ||
      !session.currentAccount ||
      !communityData.community_view.community.id
    )
      return;
    const res = await subscribeToCommunity({
      community_id: communityData.community_view.community.id,
      auth: session.currentAccount.jwt,
      follow: true,
    });
    if (!res) {
      console.error("Could not follow community");
    } else {
      setCommunityData({
        ...communityData,
        community_view: {
          ...communityData.community_view,
          subscribed: "Subscribed",
        },
      });
    }
    setSubscribeLoading(false);
  };

  return (
    <>
      <div className={`${styles.bannerOverlay} absolute top-0 h-full w-full
    bg-gradient-to-b from-transparent 
    to-neutral-50 dark:to-neutral-950 mt-20`}></div>
      <Image
        height={200}
        width={500}
        src={communityData?.community_view?.community?.banner || ""}
        alt=""
        className={`${styles.banner}`}
      />
      <div className={`mt-20 flex flex-col flex-wrap items-center bg-gradient-to-b
    from-neutral-50/50
    to-neutral-50 
    pt-2 backdrop-blur-sm
    dark:from-neutral-950/50 dark:to-neutral-950`}>
        <div className="flex max-w-xl flex-row flex-wrap items-center gap-4 p-6 max-md:w-full">
          <Image
            height={40}
            width={40}
            className={`${styles.icon} ${
              !communityData?.community_view?.community?.icon &&
              "object-contain p-2"
            } `}
            src={
              communityData?.community_view?.community?.icon || DEFAULT_AVATAR
            }
            alt=""
          />
          <div className="flex h-full max-w-xl flex-col">
            <h1 className=" text-xl font-bold">
              {communityData.community_view.community.title}
            </h1>
            <span className=" text-xs text-neutral-500">
              @{communityInstance}
            </span>
            <div className="flex flex-row flex-wrap gap-2 pt-2">
              <span className="snack">
                <span className="material-symbols-outlined">communities</span>{" "}
                {FormatNumber(communityData?.community_view?.counts?.subscribers, true)} Subscribers
              </span>
              <span className="snack">
                <span className="material-symbols-outlined">group</span>{" "}
                {communityData.community_view?.counts?.users_active_day} Users /
                Day
              </span>
            </div>
          </div>
          {communityData?.community_view?.subscribed == "NotSubscribed" && (
            <button
              onClick={() => subscribe()}
              className={`rounded-lg bg-fuchsia-200 p-4
              font-medium text-fuchsia-950`}
            >
              {subscribeLoading ? (
                <ClipLoader color={"#e6b0fa"} size={20} />
              ) : (
                "Subscribe"
              )}
            </button>
          )}
        </div>

        <div className={`${styles.description}`}>
          <button
            onClick={() => setDescriptionExpanded(true)}
            className={`absolute bottom-6
            rounded-lg bg-fuchsia-100 p-4
            font-medium text-fuchsia-950 ${
              descriptionExpanded && "hidden"
            }`} style={{ zIndex: 2 }}
          >
            Tap to expand
          </button>
          <div
            className={`absolute h-full w-full
            bg-gradient-to-b from-transparent to-neutral-50 dark:to-neutral-950  ${
              descriptionExpanded && "hidden"
            }`} style={{ zIndex: 1 }}
          ></div>
          <div
            className={`${styles.descriptionContent} ${
              descriptionExpanded && "bg-neutral-50 dark:bg-neutral-950 line-clamp-none "
            } `}
          >
            <span className="font-bold">Community Description</span>
            {communityData?.community_view?.community?.description ? (
              <RenderMarkdown
                content={communityData?.community_view?.community?.description}
              />
            ) : (
              <div className=" italic ">
                This community does not have a description
              </div>
            )}
            <div className="mt-4 flex flex-col">
              <span className="font-bold">Moderators</span>
              <div className={`${styles.mods}`}>
                {communityData?.moderators?.map((moderator) => (
                  <Username
                    user={moderator?.moderator}
                    baseUrl=""
                    key={moderator?.moderator?.id}
                    opensToTop
                  />
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => setDescriptionExpanded(false)}
            className={`mt-2 p-4 ${!descriptionExpanded && "hidden"}`}
          >
            Collapse
          </button>
        </div>
      </div>

      <div className={`flex flex-row flex-wrap items-center justify-center bg-neutral-200 px-28 py-4
    dark:bg-neutral-900 dark:text-neutral-300
     max-md:p-6`}>
        <div className="flex flex-row justify-between items-center max-w-2xl px-4 w-full">
          <SortButton onChange={(newSort) => setCurrentSort(newSort as SortType)} />
        </div>

      </div>

      <div
        className={`bg-neutral-50 dark:bg-neutral-950
        dark:pt-4; flex w-full items-center justify-center pt-2`}
      >
        <PostList
          fetchParams={{
            community_name: `${communityData.community_view.community.name}@${communityInstance}`,
            sort: currentSort,
          }}
          showCommunity={false}
        />
      </div>
    </>
  );
}
