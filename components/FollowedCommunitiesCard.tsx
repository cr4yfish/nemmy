"use client";

import { useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { GetSiteResponse, CommunityView } from "lemmy-js-client";
import { motion } from "framer-motion";
import { Spinner, Input } from "@nextui-org/react";
import Image from "next/image";

import { DEFAULT_AVATAR } from "@/constants/settings";

import { listCommunities } from "@/utils/lemmy";
import { getCommunityId, handleClickCommunity } from "@/utils/helpers";

import { useSession } from "@/hooks/auth";

import { SmallCommunityCard } from "./ui/CommunityCard";

export default function FollowedCommunitiesCard({
  siteResponse,
  auth,
  instance,
}: {
  siteResponse: GetSiteResponse | null;
  auth?: string;
  instance?: string;
}) {
  const { session, setSession } = useSession();

  const [communities, setCommunities] = useState<CommunityView[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [communitySearch, setCommunitySearch] = useState<string>("");

  const handleLoadMore = async (page: number) => {
    const data = await listCommunities(
      {
        page: page,
        auth: auth,
        type_: "Subscribed",
        sort: "Active",
      },
      instance,
    );
    if (typeof data == "boolean" || data?.communities?.length == 0) {
      setHasMore(false);
      return;
    }

    setCommunities((prevState) => {
      return [...prevState, ...data.communities].sort((a, b) =>
        a.community.name.localeCompare(b.community.name),
      );
    });
  };

  return (
    <div
      className=" card flex h-fit w-full max-w-xs flex-col gap-4
            bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 max-lg:hidden
        "
    >
      <div className="prose flex h-fit w-full flex-col gap-2 dark:prose-invert prose-headings:mb-0">
        <span className=" text-lg font-bold capitalize">Your Communities</span>
      </div>

      <Input
        placeholder="Search communities"
        labelPlacement="inside"
        type="text"
        className="text-neutral-700 dark:text-neutral-200"
        onValueChange={(newVal) => setCommunitySearch(newVal || "")}
      />

      <InfiniteScroll
        pageStart={0}
        loadMore={async (page) => await handleLoadMore(page)}
        hasMore={hasMore}
        loader={<Spinner />}
        className="flex w-full flex-col gap-1"
      >
        {communities
          .filter(
            (c) =>
              c.community.name.includes(communitySearch) ||
              c.community.title.includes(communitySearch),
          )
          .map((community, index) => (
            <SmallCommunityCard
              community={community}
              session={session}
              setSession={setSession}
              key={index}
            />
          ))}
      </InfiniteScroll>
    </div>
  );
}
