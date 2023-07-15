"use client"

import { usePathname } from "next/navigation"; 
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { CommentView, GetCommentsResponse, GetPostResponse } from "lemmy-js-client";
import Link from "next/link";

import { useSession } from "@/hooks/auth";
import { useNavbar } from "@/hooks/navbar";

import { AutoMediaType } from "@/utils/AutoMediaType";
import { sendComment } from "@/utils/lemmy";
import { restoreScrollPos } from "@/utils/scrollPosition";

import styles from "@/styles/Pages/PostPage.module.css";
import markdownStyle from "@/styles/util/markdown.module.css";

import { FormatDate } from "@/utils/formatDate";

import Username from "@/components/User/Username";
import Vote from "@/components/Vote";
import RenderMarkdown from "@/components/ui/RenderMarkdown";
import Comments from "./Comments";

export default function PostPage({ data, instance, jwt } :  { data: GetPostResponse, instance?: string, jwt?: string }) {
    const { navbar, setNavbar } = useNavbar();
    const { session } = useSession();

    const [postData, setPostData] = useState<GetPostResponse>(data);
    const [postDataError, setPostDataError] = useState(true);
    const [baseUrl, setBaseUrl] = useState<string>("");

    const [commentsData, setCommentsData] = useState<GetCommentsResponse>({} as GetCommentsResponse);
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
        const ap_id = postData?.post_view?.post?.ap_id;
        const domain = ap_id?.split("/")[2];
        setBaseUrl(domain);
        restoreScrollPos(pathname);

    }, [postData]);

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

        <div className={`${styles.pageWrapper} mt-20`}>
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

      
               
            </div>

        </div>

        <Comments 
            postId={postData?.post_view?.post?.id}
            instance={baseUrl} jwt={jwt}
            postData={postData} setPostData={setPostData}
        />

        </>
    )
}