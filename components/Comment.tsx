"use client"
import { CommentView, GetCommentsResponse } from "lemmy-js-client"
import React, { useState, useEffect, Dispatch, SetStateAction, useRef } from "react"


import RenderMarkdown from "./ui/RenderMarkdown"
import Vote from "./Vote"
import Username from "./User/Username"
import BookmarkButton from "./ui/BookmarkButton"

import { useSession } from "@/hooks/auth"

import { FormatDate } from "@/utils/formatDate"
import { sendComment } from "@/utils/lemmy"


// Tailwind colors for comment chain colors
const colors = ["bg-red-300", "bg-orange-300", "bg-amber-300", "bg-yellow-300", "bg-lime-300", "bg-green-300", 
    "bg-emerald-300", "bg-teal-300", "bg-cyan-300", "bg-lightBlue-300", "bg-blue-300", "bg-indigo-300", "bg-violet-300", "bg-purple-300", "bg-fuchsia-300", "bg-pink-300", "bg-rose-300"]

import styles from "@/styles/Comment.module.css"
import RenderFormattingOptions from "./ui/RenderFormattingOptions"

export default function Comment({ commentView, allComments, depth=0, setReplyComment, setShowReply, commentReplyMode=false }: { 
    commentView: CommentView, allComments: CommentView[], 
    depth?: number, setReplyComment: Dispatch<SetStateAction<CommentView>>, 
    setShowReply: React.Dispatch<React.SetStateAction<boolean>>,
    commentReplyMode?: boolean
    }) {
    const { session } = useSession();
    const [children, setChildren] = useState<CommentView[]>([]);
    const [childrenHidden, setChildrenHidden] = useState(false);
    const [childrenError, setChildrenError] = useState(true);
    const [showDesktopReply, setShowDesktopReply] = useState(false);
    const [replyText, setReplyText] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Adjust textarea height to content on user input
    useEffect(() => {
        const textarea = textareaRef.current;

        function adjustHeight() {
            if(!textarea) return;
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        }

        textarea?.addEventListener("input", adjustHeight);
        adjustHeight();

        // Cleanup on onmount
        return () => {
            textarea?.removeEventListener("input", adjustHeight);
        }

    }, [])


    // Load children from api
    useEffect(() => {
        if(!childrenError) return;
        if(children.length > 0) return;
        if(loading) return;
        if(depth > 10) return;

        (async () => {
            if(session.pendingAuth) return;
            setLoading(true)
            try {
                console.log("fetching children")
                const data = await fetch(`/api/getComments?post_id=${commentView.comment.post_id}&parent_id=${commentView.comment.id}&sort=Top&page=1&auth=${session.currentAccount?.jwt}
                `);
                const json = (await data.json());
                if(json.error) {
                    console.error(json.error)
                    setChildrenError(true);
                    setLoading(false)
                    return;
                } else {
                    setChildrenError(false);
                    const comments = json as GetCommentsResponse;
                    setChildren(comments.comments.filter(c => c.comment.id !== commentView.comment.id));
                    setLoading(false)
                }
            } catch(e) {
                setLoading(false)
                console.error(e);
            }  
        })()
    }, [commentView, allComments, childrenError])

    const handleToggleChildren = () => {
        children.length > 0 ? setChildrenHidden(!childrenHidden) : null;
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!session.currentAccount || session.pendingAuth) return;
        if(!replyText) return;
        if(!commentView?.comment) return

        const response = await sendComment({
            auth: session.currentAccount.jwt,
            content: replyText,
            parent_id: commentView.comment.id,
            post_id: commentView.comment.post_id,
        })

        if(!response) {
            console.error("Error sending comment");
            return;
        }

    }

    const handleReply = () => {
        if(window?.innerWidth > 768) {
            setShowDesktopReply(!showDesktopReply)
        }  else {
            setReplyComment(commentView);
            setShowReply(true);
        }
    }

    return (
        <>
        <div className={`${styles.wrapper}`}>


            <div className={`${styles.header}`}>
                <div className={`${styles.username}`}><Username user={commentView?.creator} baseUrl="" /></div>
                <span className={`${styles.date}`}><FormatDate date={new Date(commentView?.comment?.published)} /></span>
                {(commentView?.comment?.deleted || commentView?.comment?.removed) && <span className=" bg-red-400 text-red-950 p-2 rounded-full" >Removed</span>}
            </div>

            <div className={`${styles.body}`}>
                <div className={`${styles.chainlineWrapper} `} onClick={() => handleToggleChildren()} >
                    <div className={`${styles.chainlineLine} ${colors[depth]}`}></div>
                </div>
                <div className={`${styles.content}`}>

                    <div className={`${styles.comment}`}>
                        <div className={`${styles.commentText}`}>
                            <RenderMarkdown>{commentView?.comment?.content}</RenderMarkdown>
                        </div>
                        <div className={`${styles.commentInteractions}`}>
                            <Vote comment={commentView} isComment horizontal />
                            <div className="flex flex-row gap-4 items-center">
                                <button onClick={() => handleReply()} className={`${styles.interaction}`}><span className="material-icons">chat_bubble_outline</span>Reply</button>
                                {session?.currentAccount?.jwt &&
                                    <BookmarkButton 
                                        type="comment"
                                        id={commentView.comment.id}
                                        auth={session.currentAccount.jwt}
                                        instance={session.currentAccount.instance}
                                        initState={commentView.saved}
                                    />
                                }
                                <div className={`${styles.interaction}`}><span className="material-icons">more_vert</span></div>
                            </div>
                            
                        </div>
                    </div>

                    { showDesktopReply &&
                    <form onSubmit={handleSubmit} className=" max-md:hidden overflow-hidden p-4 rounded-lg dark:bg-neutral-900 dark:text-neutral-50 flex flex-col items-end relative">
                        <button onClick={() => setShowDesktopReply(false)} className="flex items-center justify-center absolute right-5 top-5 text-red-400"><span className="material-symbols-outlined">close</span></button>
                        <div className="flex flex-row overflow-x-auto w-full overflow-y-hidden h-fit p-2 pb-4 pl-0 gap-2">
                            <RenderFormattingOptions />
                        </div>
                        <textarea 
                            name="" id="" 
                            placeholder="Write a reply..."
                            maxLength={10000}
                            required
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            ref={textareaRef}
                            className="bg-transparent h-full w-full resize-y outline-none text-sm dark:text-neutral-50"
                        />
                        <button type="submit" className="flex items-center gap-2 text-blue-500 m-3">
                            <span>Reply</span>
                            <span className="material-symbols-outlined">send</span>
                        </button>

                    </form>
                    }

                    {(!childrenHidden) && 
                        <div className="flex flex-col gap-0">
                            {children?.map((comment, index) => (
                                <Comment commentView={comment} allComments={allComments} key={index} depth={depth+1} setReplyComment={setReplyComment} setShowReply={setShowReply} />
                            ))}
                        </div>
                    }
                    {childrenHidden && children.length > 0 &&
                    <div onClick={() => handleToggleChildren()}>
                        <div className={`flex items-center gap-1 dark:bg-neutral-800 w-full rounded-lg p-2 text-sm`}>
                            <span className={`material-icons text-sm`}>expand_more</span>
                            Tap to see {children.length} {children.length == 1 ? "comment" : "comments"}
                        </div>
                    </div>
                    }

                </div>
                
            </div>
            
            
        </div>
        </>
    )
}