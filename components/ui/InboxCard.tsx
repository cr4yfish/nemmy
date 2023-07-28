"use client"

import { useEffect, useState } from "react";
import { CommentReplyView, CommentView, GetPersonDetailsResponse, LemmyHttp } from "lemmy-js-client";
import Link from "next/link";

import Username from "@/components/User/Username";
import RenderMarkdown from "@/components/ui/RenderMarkdown";
import { FormatDate } from "@/utils/formatDate";
import { ClipLoader } from "react-spinners";

const getReplyComment = async (id: number, auth: string, instance: string) => {
    const lemmy = new LemmyHttp(`https://${instance}`);
    const comment = await lemmy.getComment({
        id: id,
        auth: auth
    })
    return comment;
}

const markAsRead = async (id: number, auth: string, instance: string) => {
    const lemmy = new LemmyHttp(`https://${instance}`);
    const comment = await lemmy.markCommentReplyAsRead({
        comment_reply_id: id,
        auth: auth,
        read: true
    })
    return comment;
}

export default function InboxCard({ reply, auth, instance } : { reply: CommentReplyView, auth: string, instance: string }) {
    const [replyComment, setReplyComment] = useState<CommentView>({} as CommentView);
    const [loading, setLoading] = useState<boolean>(false);
    const isPostComment = reply.comment.path.split(".").length == 2;

    const [isRead, setIsRead] = useState<boolean>(reply.comment_reply.read);
    const [markAsReadLoading, setMarkAsReadLoading] = useState<boolean>(false);

    useEffect(() => {
        if(loading || !auth || !instance) return;
        if(!isPostComment) {
            console.log(reply)
            setLoading(true);
            const path = reply.comment.path.split(".");
            const parentId = parseInt(path[path.length - 2]);
            getReplyComment(parentId, auth, instance).then((comment) => {
                setReplyComment(comment.comment_view);
                setLoading(false);
            })
        }
        setIsRead(reply.comment_reply.read);
    }, [reply])

    const handleMarkAsRead = async (id: number, auth: string, instance: string) => {
        setMarkAsReadLoading(true);
        const res = await markAsRead(id, auth, instance);
        setMarkAsReadLoading(false);
        setIsRead(res.comment_reply_view.comment_reply.read);
    }

    return (
        <>
        <div
            className=" bg-fuchsia-100 dark:bg-neutral-950 
            dark:border-b border-neutral-400 dark:rounded-none p-4 py-6 flex flex-col rounded-lg
            gap-2 transition-colors
            "
        
            >
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row items-center gap-2">
                    <span className="material-symbols-outlined text-fuchsia-500 dark:text-fuchsia-200">{isPostComment ? "chat" : "reply"}</span>
                    <span className="flex flex-col flex-wrap items-start justify-start gap-0">
                        <Username user={reply.creator} baseUrl="" />
                        <span className=" text-neutral-600 dark:text-neutral-400">has replied to your { isPostComment ? `post "${reply.post.name}"` : "comment" }</span>
                        {isRead ? <></> : 
                            <button 
                                disabled={markAsReadLoading} 
                                onClick={() => handleMarkAsRead(reply.comment.id, auth, instance)} 
                                className="text-fuchsia-500 dark:text-fuchsia-200">
                                    Unread 
                                    <ClipLoader color={"#e6b0fa"} loading={markAsReadLoading} size={20} className="" />
                            </button>
                        }
                    </span>
                </div>
                <Link href={`/post/${reply.post.id}/comment/${reply.comment.id}`} target="_blank">
                    <button className="flex items-center gap-1 a">
                        <span className="material-symbols-outlined">open_in_new</span>
                        <span>Open</span>
                    </button>
                </Link>
            </div>
            <div className="flex flex-row items-center gap-2 text-xs text-neutral-500 dark:text-neutral-300">
                <div className="">{FormatDate({ date: new Date(reply.comment.published)})}</div>
                <div className="dividerDot"></div>
                <div className="">{reply.community.name} @ {new URL(reply.comment.ap_id).host}</div>
            </div>
            <div  className="dark:text-neutral-200 flex flex-col gap-2">
                {!isPostComment &&
                    <div className=" dark:bg-neutral-800 p-4 text-xs rounded-lg flex flex-col gap-1">
                        <ClipLoader color={"#e6b0fa"} loading={loading} size={20} className="" />
                        <div className="flex flex-row items-center">
                            <span className="font-bold">@{replyComment?.creator?.name}</span>
                            <div className="dividerDot"></div>
                            {reply.comment.published && <span>{FormatDate({date: new Date(reply.comment.published)})}</span>}
                        </div>
                        <div className=" line-clamp-5"><RenderMarkdown content={replyComment?.comment?.content} /></div>
                    </div>
                }
                <RenderMarkdown content={reply.comment.content} />
            </div>
        </div>
        </>
    )
}