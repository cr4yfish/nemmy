import {
  LemmyHttp,
  GetRepliesResponse,
  GetPersonDetailsResponse,
} from "lemmy-js-client";
import { cookies } from "next/dist/client/components/headers";
import { cache } from "react";

import InboxCard from "@/components/ui/InboxCard";
import InboxInfiniteScroller from "@/components/ui/InboxInfiniteScroller";

import { DEFAULT_INSTANCE } from "@/constants/settings";
import { getCurrentAccountServerSide } from "@/utils/authFunctions";
import { getClient } from "@/utils/lemmy";

const getReplies = cache(
  async ({
    jwt,
    instance,
  }: {
    jwt?: string;
    instance?: string;
  }): Promise<GetRepliesResponse> => {
    const lemmy = getClient(instance);
    const replies = await lemmy.getReplies({
      auth: jwt ? jwt : "",
      sort: "New",
      page: 1,
      unread_only: false,
    });
    return replies;
  },
);

export const metadata = {
  title: "Inbox - Nemmy",
  description: "View your inbox on Nemmy.",
};

export default async function Inbox({
  params: { page },
}: {
  params: { page: number };
}) {
  const cookieStore = cookies();
  const currentAccount = getCurrentAccountServerSide(cookieStore);

  if (!currentAccount) return <></>;

  const replies = await getReplies({
    instance: currentAccount?.instanceAccounts[0]?.instance,
    jwt: currentAccount?.instanceAccounts[0]?.jwt,
  });
  return (
    <>
      <div className="flex h-full max-w-3xl flex-col gap-4 overflow-y-hidden dark:gap-0">
        {replies.replies.map((reply, i) => (
          <InboxCard
            key={i}
            reply={reply}
            auth={currentAccount?.instanceAccounts[0]?.jwt || ""}
            instance={currentAccount?.instanceAccounts[0]?.instance || ""}
          />
        ))}
        {currentAccount && (
          <InboxInfiniteScroller
            initReplies={replies}
            auth={currentAccount.instanceAccounts[0]?.jwt || ""}
            instance={currentAccount.instanceAccounts[0]?.instance}
          />
        )}
      </div>
    </>
  );
}
