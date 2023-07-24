"use client"

import { GetRepliesResponse } from "lemmy-js-client";
import InfiniteScroll from "react-infinite-scroller";
import { useState } from "react";
import { ClipLoader } from "react-spinners";

import { getReplies } from "@/utils/lemmy";

import InboxCard from "@/components/ui/InboxCard";
import EndlessScrollingEnd from "./EndlessSrollingEnd";


export default function InboxInfiniteScroller({ initReplies, auth, instance } : { initReplies: GetRepliesResponse, auth: string, instance: string }) {

    const [replies, setReplies] = useState<GetRepliesResponse>(initReplies);
    const [currentPage, setCurrentPage] = useState<number>(2);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const handleLoadMore = () => {
        getReplies({ auth: auth, page: currentPage + 1, sort: "New", unread_only: false }, instance).then((res) => {
            if(!res || res.replies.length == 0) {
                setHasMore(false)
                return 
            };
            setReplies({
                ...replies,
                replies: replies.replies.concat(res.replies),
            });
            setCurrentPage(currentPage + 1);
        })
    }

    return (
        <>
        <InfiniteScroll
            pageStart={1}
            loadMore={handleLoadMore}
            hasMore={hasMore}
            className="flex flex-col gap-4 dark:gap-0 max-w-3xl h-full overflow-y-hidden"
            loader={<div key={"loader"} className=" w-full py-6 flex justify-center items-center"><ClipLoader color={"#e6b0fa"} size={20} /></div>}
        >
            {replies.replies.map((reply, i) => (
                    <InboxCard key={i} reply={reply} />
            ))}
            {!hasMore && <EndlessScrollingEnd key={"end"} /> }
        </InfiniteScroll>
        </>
    )
}