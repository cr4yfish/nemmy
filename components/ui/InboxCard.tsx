

import { CommentReplyView } from "lemmy-js-client";
import { useEffect } from "react";

import Username from "@/components/User/Username";
import RenderMarkdown from "@/components/ui/RenderMarkdown";
import Link from "next/link";


export default function InboxCard({ reply } : { reply: CommentReplyView }) {

    if(!reply) return null;

    const isPostComment = reply.comment.path.split(".").length == 2;
    
    return (
        <>
        <div
            className=" bg-fuchsia-100 dark:bg-neutral-950 
            dark:border-b border-neutral-400 dark:rounded-none p-4 py-6 flex flex-col rounded-lg
            gap-2 dark:hover:bg-neutral-800 hover:bg-fuchsia-200 transition-colors cursor-pointer
            ">
            <div className="flex flex-row items-center gap-2">
                <span className="material-symbols-outlined text-fuchsia-500 dark:text-fuchsia-200">{isPostComment ? "chat" : "reply"}</span>
                <span className="flex flex-col flex-wrap items-start justify-start gap-0">
                    <Username user={reply.creator} baseUrl="" />
                    <span className=" text-neutral-600 dark:text-neutral-400">has replied to your { isPostComment ? `post "${reply.post.name}"` : "comment" }</span>
                    {reply.comment_reply.read ? <></> : <span className="text-fuchsia-500 dark:text-fuchsia-200">Unread</span>}
                </span>
            </div>
            <div className="dark:text-neutral-200">
                <RenderMarkdown content={reply.comment.content} />
            </div>
        </div>
        </>
    )
}