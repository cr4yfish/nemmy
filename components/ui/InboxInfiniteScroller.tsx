"use client";

import { GetPersonDetailsResponse, GetRepliesResponse } from "lemmy-js-client";
import InfiniteScroll from "react-infinite-scroller";
import { useState } from "react";
import { ClipLoader } from "react-spinners";

import { getReplies } from "@/utils/lemmy";

import InboxCard from "@/components/ui/InboxCard";
import EndlessScrollingEnd from "./EndlessSrollingEnd";

export default function InboxInfiniteScroller({
  initReplies,
  auth,
  instance,
}: {
  initReplies: GetRepliesResponse;
  auth: string;
  instance: string;
}) {
  const [replies, setReplies] = useState<GetRepliesResponse>(initReplies);
  const [currentPage, setCurrentPage] = useState<number>(2);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const handleLoadMore = () => {
    getReplies(
      { auth: auth, page: currentPage + 1, sort: "New", unread_only: false },
      instance,
    ).then((res) => {
      if (!res || res.replies.length == 0) {
        setHasMore(false);
        return;
      }
      setReplies({
        ...replies,
        replies: replies.replies.concat(res.replies),
      });
      setCurrentPage(currentPage + 1);
    });
  };

  return (
    <>
      <InfiniteScroll
        pageStart={1}
        loadMore={handleLoadMore}
        hasMore={hasMore}
        className="flex h-full max-w-3xl flex-col gap-4 overflow-y-hidden dark:gap-0"
        loader={
          <div
            key={"loader"}
            className=" flex w-full items-center justify-center py-6"
          >
            <ClipLoader color={"#e6b0fa"} size={20} />
          </div>
        }
      >
        {replies.replies.map((reply, i) => (
          <InboxCard key={i} reply={reply} auth={auth} instance={instance} />
        ))}
        {!hasMore && <EndlessScrollingEnd key={"end"} />}
      </InfiniteScroll>
    </>
  );
}
