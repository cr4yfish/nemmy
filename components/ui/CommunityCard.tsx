import { CommunityView } from "lemmy-js-client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";

import { DEFAULT_AVATAR } from "@/constants/settings";

import { handleClickCommunity, getCommunityId } from "@/utils/helpers";

import { SessionState } from "@/hooks/auth";

export function SmallCommunityCard({
  community,
  session,
  setSession,
}: {
  community: CommunityView;
  session: SessionState;
  setSession: Dispatch<SetStateAction<SessionState>>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
    >
      <motion.button
        onClick={() => handleClickCommunity(community, session, setSession)}
        className={`duration-50 flex w-full flex-row items-center justify-between gap-20 rounded-lg p-2 transition-all
                ${
                  session.session.selectedCommunities.includes(
                    getCommunityId(
                      community.community.name,
                      community.community.actor_id,
                    ),
                  )
                    ? "bg-neutral-100 dark:bg-neutral-800"
                    : "bg-transparent"
                }
            `}
      >
        <div className="flex flex-row gap-2">
          <Image
            width={20}
            height={20}
            className="h-8 w-8 rounded-full object-cover"
            src={community.community.icon || DEFAULT_AVATAR}
            alt=""
          />
          <div className="flex flex-col items-start justify-start text-neutral-500 dark:text-neutral-300">
            <span className="text-xs font-bold">
              {community.community.name}
            </span>
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              {new URL(community.community.actor_id).host}
            </span>
          </div>
        </div>

        {session.session.selectedCommunities.includes(
          getCommunityId(
            community.community.name,
            community.community.actor_id,
          ),
        ) && (
          <span className=" material-symbols-outlined text-neutral-500 dark:text-neutral-700">
            close
          </span>
        )}
      </motion.button>
    </motion.div>
  );
}
