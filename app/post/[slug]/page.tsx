"use client";

import { usePathname } from "next/navigation"; 
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { CommentView, GetCommentsResponse, GetPostResponse } from "lemmy-js-client";
import RenderMarkdown from "@/components/ui/RenderMarkdown";
import Image from "next/image";
import Link from "next/link";
import { AutoMediaType } from "@/utils/AutoMediaType";
import Username from "@/components/User/Username";
import Comment from "@/components/Comment";
import { useNavbar } from "@/hooks/navbar";
import { BounceLoader, ClipLoader } from "react-spinners";
import { useSession } from "@/hooks/auth";
import Vote from "@/components/Vote";
import RenderFormattingOptions from "@/components/ui/RenderFormattingOptions";
import WriteCommentOverlay from "@/components/WriteCommentOverlay";
import { sendComment, getComments } from "@/utils/lemmy";
import InfiniteScroll from "react-infinite-scroller";

import styles from "../../../styles/Pages/PostPage.module.css";
import markdownStyle from "@/styles/util/markdown.module.css";
import { FormatDate } from "@/utils/formatDate";
import { handleWebpackExternalForEdgeRuntime } from "next/dist/build/webpack/plugins/middleware-plugin";

export default function Post() {
    const { navbar, setNavbar } = useNavbar();
    const { session } = useSession();

    const [postData, setPostData] = useState<GetPostResponse>({} as GetPostResponse);
    const [postDataError, setPostDataError] = useState(true);
    const [baseUrl, setBaseUrl] = useState<string>("");

    const [commentsData, setCommentsData] = useState<GetCommentsResponse>({} as GetCommentsResponse);
    const [currentCommentsPage, setCurrentCommentsPage] = useState<number>(1);
    const [forceCommentUpdate, setForceCommentUpdate] = useState<number>(0);
    const [commentsLoading, setCommentsLoading] = useState<boolean>(true);
    const [replyLoading, setReplyLoading] = useState<boolean>(false);

    const [showReply, setShowReply] = useState<boolean>(false);
    const [replyComment, setReplyCommet] = useState<CommentView>({} as CommentView);
    const [replyCommentText, setReplyCommentText] = useState<string>("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // post id
    const pathname = usePathname().split("/")[2];

    useEffect(() => {
        setNavbar({ ...navbar!, showSort: false, showFilter: false, showSearch: false, showback: false, hidden: false })
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
        handleLoadMoreComments();
    }, [forceCommentUpdate, baseUrl, session.pendingAuth]);


    const handleLoadMoreComments = async () => {
        if(session?.pendingAuth) return;
        if(!postData?.post_view?.post?.id) return;

        setCommentsLoading(true);
        const data = await getComments({
            post_id: postData.post_view.post.id,
            sort:"Hot",
            limit:100,
            max_depth: 8,
            page:currentCommentsPage,
            auth: session.jwt
        }, baseUrl);
        if(data) { 
            setCommentsLoading(false)
            if(commentsData?.comments?.length > 0) {
                const oldData = commentsData;
                const newData = data;

                // filter out duplicates
                const filtered = newData.comments.filter((newComment) => {
                    return !oldData.comments.some((oldComment) => {
                        return oldComment.comment.id === newComment.comment.id;
                    })
                })

                setCommentsData({ ...oldData, comments: [...oldData.comments, ...filtered] });
            } else {
                setCommentsData(data);
            }
            setCurrentCommentsPage(currentCommentsPage + 1);
        }
    }


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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setReplyLoading(true);

        if(!session.jwt || !postData.post_view.post.id || replyCommentText.length < 1) return;

        const comment = await sendComment({
            content: replyCommentText,
            post_id: postData?.post_view?.post?.id,
            parent_id: replyComment?.comment?.id,
            auth: session.jwt
        });

        if(!comment) return alert("Something went wrong");

        const oldComments = commentsData.comments;
        const newComments = [comment, ...oldComments];
        setCommentsData({ ...commentsData, comments: newComments });

        const oldPostData = postData;
        const newPostData = { ...oldPostData, post_view: { ...oldPostData.post_view, post: { ...oldPostData.post_view.post, num_comments: oldPostData.post_view.counts.comments + 1 } } }
        setPostData(newPostData);

        setReplyCommentText("");
        setShowReply(false);



        setReplyLoading(false);
    }
    
    return (
        <>

        <WriteCommentOverlay 
            post={postData} comment={replyComment} show={showReply} setShow={setShowReply}
            allComments={commentsData} setPost={setPostData} setComments={setCommentsData}
        />

        <main className={`${styles.pageWrapper} mt-20`}>
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
                                    <div className="dividerDot"></div>
                                    <span className="text-neutral-400 text-xs"><FormatDate date={new Date(postData?.post_view?.post?.published)} /></span>
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

                <form onSubmit={(e) => handleSubmit(e)} className={`${styles.textarea}`}>
                    <div className="flex flex-row gap-2 dark:text-neutral-400 border-b dark:border-neutral-700 pb-2 mb-1 w-full">
                        <RenderFormattingOptions />
                    </div>
                    <textarea 
                        disabled={replyLoading}
                        placeholder={"What are your toughts?..."} 
                        required maxLength={50000}
                        ref={textareaRef}
                        value={replyCommentText}
                        onChange={() => setReplyCommentText(textareaRef.current?.value || "")}
                    />
                    {
                    replyLoading ?
                    <ClipLoader color="#487be0" loading={true} size={25} />
                    :
                    <button type="submit" className="flex items-center gap-2 text-blue-500 m-3">
                        Post Comment
                        <span className="material-symbols-outlined">send</span>
                    </button>
                    }
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

                    {/* Comments  */}
                    <div className={`${styles.commentsList}`}>
                        {commentsData?.comments?.filter((c) => !c.comment.deleted && !c.comment.removed && c.comment.path.split(".")[1] == c.comment.id.toString()).map((comment, index) => (
                            <Comment 
                                commentView={comment} allComments={commentsData.comments}
                                key={index} 
                                setReplyComment={setReplyCommet} setShowReply={setShowReply}
                                />
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

                    {commentsData?.comments?.length > 1 && !commentsLoading &&
                        <div className="flex justify-center items-center w-full mb-10">
                        <button onClick={() => handleLoadMoreComments()}><span className="material-symbols-outlined">expand_circle_down</span></button>
                    </div>
                    }
                </div>
            </div>
        </main>

        </>
    )
}