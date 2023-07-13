"use client";

import { usePathname } from "next/navigation"; 
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { CommentResponse, CommentView, GetCommentsResponse, GetPostResponse } from "lemmy-js-client";
import RenderMarkdown from "@/components/ui/RenderMarkdown";
import Image from "next/image";
import Link from "next/link";
import { AutoMediaType } from "@/utils/AutoMediaType";
import Username from "@/components/User/Username";
import Comment from "@/components/Comment";
import { useNavbar } from "@/hooks/navbar";
import { BounceLoader } from "react-spinners";
import { useSession } from "@/hooks/auth";
import Vote from "@/components/Vote";

import styles from "../../../styles/Pages/PostPage.module.css";
import markdownStyle from "@/styles/util/markdown.module.css";


function RenderFormattingOptions() {

    return (
        <>
        <button className=" flex items-center "><span className="material-symbols-outlined">format_bold</span></button>
        <button className=" flex items-center "><span className="material-symbols-outlined">format_italic</span></button>
        <button className=" flex items-center "><span className="material-symbols-outlined">link</span></button>
        <button className=" flex items-center "><span className="material-symbols-outlined">add_reaction</span></button>
        <button className=" flex items-center "><span className="material-symbols-outlined">add_photo_alternate</span></button>
        <button className=" flex items-center "><span className="material-symbols-outlined">format_h1</span></button>
        <button className=" flex items-center "><span className="material-symbols-outlined">strikethrough_s</span></button>
        <button className=" flex items-center "><span className="material-symbols-outlined">format_quote</span></button>
        <button className=" flex items-center "><span className="material-symbols-outlined">format_list_bulleted</span></button>
        <button className=" flex items-center "><span className="material-symbols-outlined">code</span></button>
        <button className=" flex items-center "><span className="material-symbols-outlined">ad_group_off</span></button>
        <button className=" flex items-center "><span className="material-symbols-outlined">superscript</span></button>
        </>
    )
}


export default function Post() {
    const { navbar, setNavbar } = useNavbar();
    const { session } = useSession();

    const [postData, setPostData] = useState<GetPostResponse>({} as GetPostResponse);
    const [postDataError, setPostDataError] = useState(true);
    const [baseUrl, setBaseUrl] = useState<string>("");

    const [commentsData, setCommentsData] = useState<GetCommentsResponse>({} as GetCommentsResponse);
    const [commentsDataError, setCommentsDataError] = useState(true);
    const [forceCommentUpdate, setForceCommentUpdate] = useState<number>(0);
    const [commentsLoading, setCommentsLoading] = useState<boolean>(true);

    const [showReply, setShowReply] = useState<boolean>(false);
    const [replyComment, setReplyCommet] = useState<CommentView>({} as CommentView);
    const [replyCommentText, setReplyCommentText] = useState<string>("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // post id
    const pathname = usePathname().split("/")[2];

    useEffect(() => {
        setNavbar({ ...navbar!, showSort: false, showFilter: false, showSearch: false, showback: false })
    }, [])

    useEffect(() => {
        if(!postDataError) return;
        if(session.pendingAuth) return;
        (async () => {
            const data = await fetch(`/api/getPost?id=${pathname}&auth=${session.jwt}`);
            const json = (await data.json());
            if(json.error) { 
                console.error(json.error)
                setPostDataError(true);
            } else {
                setPostDataError(false);
                setPostData(json as GetPostResponse);
                // Get baseUrl from post
                const ap_id = json?.post_view?.post?.ap_id;
                const domain = ap_id?.split("/")[2];
                setBaseUrl(domain);

                return;
            }
        })();

    }, [pathname, postDataError, session]);

    useEffect(() => {
        if(!commentsDataError) {return};
        if(session.pendingAuth) return;
        (async () => {
            setCommentsLoading(true);
            const data = await fetch(`/api/getComments?post_id=${pathname}&sort=Hot&limit=100&page=1&max_depth=8&baseUrl=${baseUrl}&type_=All&auth=${session.jwt}`);
            const json = (await data.json());
            if(json.error) {
                console.error(json.error)
                setCommentsDataError(true);
                return;
            }
            setCommentsLoading(false);
            setCommentsData(json as GetCommentsResponse);
        })()
    }, [commentsDataError, forceCommentUpdate, baseUrl, session]);


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

    const sendComment = async (e: FormEvent) => {
        e.preventDefault();
        if(replyCommentText.length < 1) return alert("Comment cannot be empty");
        const data: CommentResponse = await fetch(`/api/createComment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ content: replyCommentText, auth: session?.jwt, post_id: postData?.post_view?.post?.id, parent_id: replyComment?.comment?.id })
        }).then(res => res.json());

        if(!data?.comment_view?.comment?.id) return alert("Something went wrong sending the comment");
            
        setReplyCommentText("");

        const oldComments = commentsData?.comments;
        const newComments = [data.comment_view, ...oldComments];
        setCommentsData({ comments: newComments });

        const oldPostData = postData;
        const newPostData = { ...oldPostData, post_view: { ...oldPostData.post_view, counts: { ...oldPostData.post_view.counts, comments: oldPostData.post_view.counts.comments + 1 } } }
        setPostData(newPostData);

        // close mobile overlay
        setShowReply(false);
    }
    
    return (
        <>
        <main className={`${styles.pageWrapper}`}>
            <div className={`${styles.wrapper}`}>
                <div className={`${styles.post}`}>
                    <div className={`${styles.postHeader}`}>
                        <div className={`${styles.postHeaderMetadata}`}>
                            <div className={`${styles.communityImage}`}><img src={postData?.post_view?.community?.icon} /></div>
                            <div className={`${styles.postHeaderMetadataContent}`}>
                                <span>c/{postData?.post_view?.community?.name}</span>
                                <span className={`${styles.postHeaderMetadataContentUsername}`}>
                                    <span className="max-sm:hidden">Posted by</span>
                                    <Username user={postData?.post_view?.creator} baseUrl="" />
                                </span>
                            </div>
                        </div>
                        <div className={`${styles.postHeaderTitle}`}>
                            <h1>{postData?.post_view?.post?.name}</h1>
                        </div>
                    </div>

                    <div className={`${styles.postContent}`}>

                        {/* Display Media e.g. Image, Video, Gif */ }
                        { (postData?.post_view?.post?.url || postData?.post_view?.post?.embed_video_url) && !postData?.post_view?.post?.url?.endsWith(".html") &&
                        <div className={`${styles.postBodyMedia}`}>
                            {postData?.post_view?.post?.url && <AutoMediaType url={postData?.post_view?.post?.url} />}
                            {postData?.post_view?.post?.embed_video_url && <AutoMediaType url={postData?.post_view?.post?.embed_video_url} />}
                        </div>
                        }

                        {/* Display Embed thumbnail with Link e.g. Article */ }
                        { (postData?.post_view?.post?.embed_title || postData?.post_view?.post?.url?.endsWith(".html")) &&
                            <div className={`${styles.postBodyEmbed}`}>
                                <div>
                                    <div className={`${styles.postBodyEmbedTitle}`}>{postData?.post_view?.post?.embed_title}</div>
                                    <div className={`${styles.postBodyEmbedDescription}`}>{postData?.post_view?.post?.embed_description}</div>
                                </div>
                                
                                {postData?.post_view?.post?.thumbnail_url && <div className={`${styles.postBodyEmbedImage}`}><img src={postData?.post_view?.post?.thumbnail_url} alt="" /></div>}
                                
                                {postData?.post_view?.post?.url && 
                                    <Link className="a" href={postData.post_view.post.url} target="_blank" rel="noreferrer">
                                        {postData?.post_view?.post?.url}
                                    </Link>
                                }
                            </div>
                        }

                        {/* The Text Body rendered in Markdown */ }
                        {postData?.post_view?.post?.body && <div className={`${styles.postContentText} ${markdownStyle.markdown}`}><RenderMarkdown>{postData?.post_view?.post?.body}</RenderMarkdown></div>}
                        
                    </div>

                    <div className={`${styles.postInteractions}`}>
                        <Vote post={postData?.post_view} horizontal />
                        <div className={`${styles.interaction}`}><span className="material-icons">chat_bubble_outline</span>{postData?.post_view?.counts?.comments}</div>
                        <div className={`${styles.interaction}`}><span className="material-icons">more_vert</span></div>
                    </div>
                </div>

                <form onSubmit={(e) => sendComment(e)} className={`${styles.textarea}`}>
                    <div className="flex flex-row gap-2 dark:text-neutral-400 border-b dark:border-neutral-700 pb-2 mb-1 w-full">
                        <RenderFormattingOptions />
                    </div>
                    <textarea 
                        placeholder={"What are your toughts?..."} 
                        required maxLength={50000}
                        ref={textareaRef}
                        value={replyCommentText}
                        onChange={() => setReplyCommentText(textareaRef.current?.value || "")}
                    />
                    <button type="submit" className="flex items-center gap-1 text-blue-500 m-3">Post Comment<span className="material-symbols-outlined">send</span></button>
                </form>

                

                <button onClick={() => setShowReply(true)} className={` invisible max-md:visible fixed bottom-0 w-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 dark:border-t border-neutral-700 shadow-lg p-4 px-2 `} style={{  zIndex: "40" }} >
                    <div className={` flex items-center justify-start p-4 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-lg text-xs w-full`}>
                        <span>What are your thoughts?</span>
                    </div>
                </button>

                <div className={`${styles.comments}`}>

                    {commentsData?.comments?.length > 0 && 
                    <div className={`${styles.commentsInteractions}`}>
                        <div className={`${styles.commentsInteractionsSort}`}>
                            <span className={`material-icons`}>sort</span>
                            <span>Hot</span>
                        </div>
                    </div>
                    }
                    <div className={`${styles.commentsList}`}>
                        {commentsData?.comments?.filter((c) => c.comment.path.split(".")[1] == c.comment.id.toString()).map((comment, index) => (
                            <Comment commentView={comment} allComments={commentsData.comments} key={index} />
                        ))}
                    </div>

                    { commentsData?.comments?.length == 0 && !commentsLoading &&
                    <div className="flex justify-center items-center w-full mb-10">
                        <button onClick={() => setForceCommentUpdate(forceCommentUpdate + 1)}><span className="material-icons">refresh</span></button>
                    </div>
                    }

                    { commentsLoading &&
                        <div className="flex justify-center items-center w-full mb-10">
                            <BounceLoader color="#e6b0fa" size={20} speedMultiplier={.75} />
                        </div>
                    }
                </div>
            </div>
        </main>

        <form className={` ${showReply ? styles.showReply : styles.hideReply} top-0 left-0 w-full h-screen border-b `} style={{ zIndex: "99" }} onSubmit={(e) => sendComment(e)} >

            <div className=" bg-neutral-50 border-b border-neutral-300 dark:bg-neutral-950 dark:border-neutral-700 p-4 justify-between flex flex-row  " >
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setShowReply(false)} className="flex items-center"><span className="material-symbols-outlined text-red-600">cancel</span></button>
                    <span className="font-bold text-neutral-500">Reply</span>
                </div>
                <button type="submit" className="flex items-center gap-2 text-blue-500">
                    <span className="font-bold">Post</span>
                    <span className="material-symbols-outlined">send</span>
                </button>
            </div>

            {replyComment?.comment?.content ?
            <div className="flex flex-col">
                <div className="flex flex-row"><Username user={replyComment.creator} baseUrl="" /></div>
                <div><RenderMarkdown>{replyComment.comment.content}</RenderMarkdown></div>
            </div>
            :
            <div className="flex flex-col overflow-y-auto mb-4">
            <div className="flex flex-row items-center">
                <div className="flex flex-row items-center p-4 gap-2">
                    <img src={postData?.community_view?.community?.icon} alt="" className="h-10 w-10 rounded-full" />
                    
                    <div className=" h-full">
                        <span className="font-bold">{postData?.post_view?.post?.name}</span>
                        <Username user={postData?.post_view?.creator} baseUrl="" />
                    </div>

                </div>

                <div className="p-2">
                    <img src={postData?.post_view?.post?.thumbnail_url || postData?.post_view?.post?.url} className="rounded-lg w-20 h-20 object-contain"  alt="" />
                </div>
            </div>
            <div className=" h-12 p-4"> {postData?.post_view?.post?.body && <RenderMarkdown>{postData?.post_view?.post?.body}</RenderMarkdown>}</div>
            </div>
            }

            <div className="flex flex-col border-t border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-400 h-full">
                <div className="flex flex-row gap-1 border-b overflow-x-auto p-2 items-center">
                    <RenderFormattingOptions />
                </div>

                <textarea 
                    name="" id="" 
                    className=" bg-transparent w-full h-full p-4 outline-none dark:text-neutral-50"
                    placeholder="What are your toughts?..." 
                    maxLength={50000}
                    style={{ resize: "vertical" }}
                    value={replyCommentText}
                    onChange={(e) => setReplyCommentText(e.target.value)}
                />
            </div>

        </form>

        <div className={`top-0 left-0 backdrop-blur-2xl w-full h-full bg-neutral-50/50 dark:bg-neutral-950/50 ${showReply ? styles.showReply : styles.hideShowReply}`} style={{ zIndex: "51" }}></div>
        </>
    )
}