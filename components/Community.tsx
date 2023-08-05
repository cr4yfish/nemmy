import { CommunityView } from "lemmy-js-client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import { Spinner } from "@nextui-org/react";

import { DEFAULT_AVATAR } from "@/constants/settings";

import { useSession } from "@/hooks/auth";

import { FormatNumber } from "@/utils/helpers";
import { subscribeToCommunity } from "@/utils/lemmy";

export default function Community({
  community,
  onClick,
}: {
  community: CommunityView;
  onClick: Function;
}) {
  const { session, setSession } = useSession();

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribeLoading, setSubscribeLoading] = useState(false);

  useEffect(() => {
    if (session.siteResponse?.my_user) {
      const subCommunties = session.siteResponse.my_user.follows.map(
        (community) =>
          community.community.id +
          "@" +
          new URL(community.community.actor_id).host,
      );
      setIsSubscribed(
        subCommunties.includes(
          `${community.community.id}@${
            new URL(community.community.actor_id).host
          }`,
        ),
      );
    }
  }, [session.siteResponse?.my_user, community]);

  const handleSubscribe = async () => {
    if (session.currentAccount === undefined) return;
    try {
      setSubscribeLoading(true);
      const res = await subscribeToCommunity(
        {
          community_id: community.community.id,
          follow: !isSubscribed,
          auth: session.currentAccount.jwt,
        },
        new URL(community.community.actor_id).host,
      );
      console.log(res);
      if (res) {
        setIsSubscribed(!isSubscribed);
      }
      setSubscribeLoading(false);
    } catch (error) {
      setSubscribeLoading(false);
      alert(error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { bounce: 0.2 } }}
      exit={{ opacity: 0, y: 10 }}
      className="flex w-full flex-row items-center justify-between gap-2 rounded-xl border border-neutral-500 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <Link
        href={`/c/${community?.community?.name}@${
          new URL(community?.community?.actor_id).host
        }`}
        onClick={() => onClick()}
        className=" flex w-full flex-row items-center justify-start gap-2"
      >
        <Image
          width={48}
          height={48}
          className="h-12 w-12 rounded-full object-cover"
          src={community.community.icon || DEFAULT_AVATAR}
          alt=""
        />
        <div className="flex flex-col gap-1">
          <span className="font-bold max-sm:text-xs">
            c/{community.community.name}
          </span>
          <div className="flex flex-row items-center text-xs text-neutral-400">
            <div className="flex items-center gap-1">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "1rem" }}
              >
                communities
              </span>
              {FormatNumber(community?.counts?.subscribers, true)}
            </div>
            <div className="dividerDot"></div>
            <div className="flex items-center gap-1">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "1rem" }}
              >
                group
              </span>
              {community?.counts?.users_active_day} / Day
            </div>
            <div className="dividerDot"></div>
            <div className="flex items-center gap-1">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "1rem" }}
              >
                edit
              </span>
              {FormatNumber(community?.counts?.posts, true)}
            </div>
          </div>
        </div>
      </Link>

      <div>
        <Button
          isDisabled={subscribeLoading}
          color={isSubscribed ? "warning" : "primary"}
          onClick={() => handleSubscribe()}
          variant="faded"
          startContent={
            !subscribeLoading && (
              <span className="material-symbols-outlined">
                {isSubscribed ? "remove" : "add"}
              </span>
            )
          }
        >
          {subscribeLoading ? (
            <Spinner size="sm" />
          ) : (
            <span className=" max-sm:hidden">
              {isSubscribed ? "Unsubscribe" : "Subscribe"}
            </span>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
