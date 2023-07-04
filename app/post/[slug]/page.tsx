"use client";

import { usePathname } from "next/navigation"; 
import { useEffect, useState } from "react";
import { GetCommentsResponse, GetPostResponse } from "lemmy-js-client";

import { AutoMediaType } from "@/utils/AutoMediaType";
import Username from "@/components/User/Username";
import Comment from "@/components/Comment";

import styles from "../../../styles/Pages/PostPage.module.css";

export default function Post() {
    const [postData, setPostData] = useState<GetPostResponse>({} as GetPostResponse);
    const [postDataError, setPostDataError] = useState(true);

    const [commentsData, setCommentsData] = useState<GetCommentsResponse>({} as GetCommentsResponse);
    const [commentsDataError, setCommentsDataError] = useState(true);

    // post id
    const pathname = usePathname().split("/")[2];

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
                return;
            }
        })();

    }, [pathname, postDataError]);

    useEffect(() => {
        if(!commentsDataError) return;
        (async () => {
            const data = await fetch(`/api/getComments?post_id=${pathname}&sort=Top&limit=100&page=0&max_depth=1`);
            const json = (await data.json());
            
            if(json.error) {
                console.error(json.error)
                setCommentsDataError(true);
                return;
            }
            setCommentsData(json as GetCommentsResponse);
        })()
    }, [commentsDataError, pathname]);

    

    
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
                                    <span>Posted by</span>
                                    <Username user={postData?.post_view?.creator} baseUrl="" />
                                </span>
                            </div>
                        </div>
                        <div className={`${styles.postHeaderTitle}`}>
                            <h1>{postData?.post_view?.post?.name}</h1>
                        </div>
                    </div>

                    <div className={`${styles.postContent}`}>
                        <div className={`${styles.postContentText}`}>{postData?.post_view?.post?.body}</div>
                        <div>{postData?.post_view?.post?.embed_title}</div>
                        <div>{postData?.post_view?.post?.embed_description}</div>
                        <div className={`${styles.postBodyMedia}`}>
                        {postData?.post_view?.post?.thumbnail_url && <AutoMediaType url={postData?.post_view?.post?.thumbnail_url} />}
                            {postData?.post_view?.post?.url && <AutoMediaType url={postData?.post_view?.post?.url} />}
                            {postData?.post_view?.post?.embed_video_url && <AutoMediaType url={postData?.post_view?.post?.embed_video_url} />}
                        </div>
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
                        placeholder="What are your toughts?..." 
                        required
                        rows={2} maxLength={50000}
                        />
                </div>

                <div className={`${styles.comments}`}>
                    <div className={`${styles.commentsInteractions}`}>
                        <div className={`${styles.commentsInteractionsSort}`}>
                            <span className={`material-icons`}>sort</span>
                            <span>Hot</span>
                        </div>
                    </div>
                    <div className={`${styles.commentsList}`}>
                        {/* Comments need to be placd by the comment.id, but how do I know the correct sequence? */}
                        {commentsData?.comments?.filter((c) => c.comment.path.split(".")[1] == c.comment.id.toString()).map((comment, index) => (
                            <Comment commentView={comment} allComments={commentsData.comments} key={index} />
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}