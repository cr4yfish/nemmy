"use client";

import { usePathname } from "next/navigation"; 
import React, { useEffect, useState } from "react";
import { GetCommentsResponse, GetPostResponse } from "lemmy-js-client";
import RenderMarkdown from "@/components/ui/RenderMarkdown";
import Image from "next/image";
import Link from "next/link";
import { AutoMediaType } from "@/utils/AutoMediaType";
import Username from "@/components/User/Username";
import Comment from "@/components/Comment";
import { useNavbar } from "@/hooks/navbar";
import { BounceLoader } from "react-spinners";

import styles from "../../../styles/Pages/PostPage.module.css";
import markdownStyle from "@/styles/util/markdown.module.css";


export default function Post() {
    const { navbar, setNavbar } = useNavbar();

    const [postData, setPostData] = useState<GetPostResponse>({} as GetPostResponse);
    const [postDataError, setPostDataError] = useState(true);
    const [baseUrl, setBaseUrl] = useState<string>("");

    const [commentsData, setCommentsData] = useState<GetCommentsResponse>({} as GetCommentsResponse);
    const [commentsDataError, setCommentsDataError] = useState(true);
    const [forceCommentUpdate, setForceCommentUpdate] = useState<number>(0);
    const [commentsLoading, setCommentsLoading] = useState<boolean>(true);

    // post id
    const pathname = usePathname().split("/")[2];

    useEffect(() => {
        setNavbar({ ...navbar!, showSort: false, showSearch: false, showback: true })
    }, [])

    useEffect(() => {
        if(!postDataError) return;
        (async () => {
            const data = await fetch(`/api/getPost?id=${pathname}`);
            const json = (await data.json());
            if(json.error) { 
                console.error(json.error)
                setPostDataError(true);
            } else {
                setPostDataError(false);
                setPostData(json as GetPostResponse);
                console.log(json);
                // Get baseUrl from post
                const ap_id = json?.post_view?.post?.ap_id;
                const domain = ap_id?.split("/")[2];
                setBaseUrl(domain);

                return;
            }
        })();

    }, [pathname, postDataError]);

    useEffect(() => {
        if(!commentsDataError) { console.log("No error"); return};
        (async () => {
            console.log("Getting comments", postData);
            setCommentsLoading(true);
            const data = await fetch(`/api/getComments?post_id=${pathname}&sort=Hot&limit=100&page=1&max_depth=8&baseUrl=${baseUrl}&type_=All`);
            const json = (await data.json());
            console.log("Comments:", json);
            if(json.error) {
                console.error(json.error)
                setCommentsDataError(true);
                return;
            }
            setCommentsLoading(false);
            setCommentsData(json as GetCommentsResponse);
        })()
    }, [commentsDataError, forceCommentUpdate, baseUrl]);

    

    
    return (
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
                        <div className={`${styles.votes}`}>
                            <span className={`material-icons ${styles.upvote}`}>arrow_upward</span>
                            <span className={`${styles.votesCount}`}>{postData?.post_view?.counts?.score}</span>
                            <span className={`material-icons ${styles.downvote}`}>arrow_downward</span>
                        </div>
                        <div className={`${styles.commentsReplies}`}><span className="material-icons">chat_bubble_outline</span>{postData?.post_view?.counts?.comments}</div>
                        <div className={`${styles.commentShare}`}><span className="material-icons">share</span></div>
                        <div className={`${styles.commentMore}`}><span className="material-icons">more_vert</span></div>
                    </div>
                </div>

                <div className={`${styles.textarea}`}>
                    <textarea 
                        placeholder={"What are your toughts?..."} 
                        required
                        rows={2} maxLength={50000}
                        />
                </div>

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
    )
}