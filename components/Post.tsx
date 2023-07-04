import Image from "next/image";


import { PostView } from "lemmy-js-client";
import Username from "./User/Username";
import { AutoMediaType } from "@/utils/AutoMediaType";

import styles from "../styles/post.module.css"
import { useEffect } from "react";

export default function Post({ post } : { post: PostView }) {

    if(!post) throw new Error("Post is undefined");

    const hasMedia = post.post.embed_video_url || post.post.thumbnail_url;

    const baseUrl = new URL(post.community.actor_id).hostname;
    // https://lemmy.ml/post/1681855
    //
    //const postUrl = `https://${baseUrl}/post/${post.post.id}`;

    const postUrl = `/post/${post.post.id}`;

    useEffect(() => {
        console.log(post)
    }, [post])

    return (
        <>
        <div 
            className={`${styles.wrapper}`} key={post.post.id} 
            style={{ height: !hasMedia ? "fit-content" : "unset", cursor: hasMedia ? "unset" : "pointer" }}
        >
            <div className={`${styles.votesDesktop}`}>
                <span className={`material-icons ${styles.upvote}`}>arrow_upward</span>
                <span className={`${styles.votesCount}`}>{post.counts.score}</span>
                <span className={`material-icons ${styles.downvote}`}>arrow_downward</span>
            </div>

            <div className={`${styles.rightSide}`}>

                <div className={`${styles.header}`} >
                    <div className={`${styles.votes}`}></div>
                    <div className={`${styles.headerContent}`}>
                        <div className={`${styles.headerMetadata}`}>
                            <div className={`${styles.communityImage}`}>
                                {post?.community?.icon ?
                                    <img src={post?.community?.icon} alt="" />
                                    :
                                    <div className={`${styles.communityIconFill}`}></div>
                                }
                            </div>
                            <div className={`${styles.headerMetadataContent}`}>
                                <span className={`${styles.sub}`}>c/{post.community.name}</span>
                                <span className={`${styles.dividerDot}`}></span>
                                <div className={`${styles.user}`}>
                                    <div>Posted by</div> 
                                    <Username user={post.creator} baseUrl={baseUrl} /> 
                                    <div>on {new Date(post.post.published).toDateString()}</div>
                                </div>
                            </div>
                            
                        </div>
                        <a href={postUrl} target="_blank"  className={`${styles.headerTitle}`}>
                            <h2 className={`${styles.title}`}>{post.post.name}</h2>
                        </a>
                        <span className={`${styles.headerLink}`}></span>
                    </div>
                </div>
                <div className={`${styles.content}`}>
                    <div className={`${styles.contentOverlay}`} style={{ display: hasMedia ? "none" : "block" }}></div>
                    <div className={`${styles.body}`}>{post.post.body}</div> 
                    {post.post.embed_video_url &&
                        <div className={`${styles.video}`}>
                            <AutoMediaType url={post.post.embed_video_url} alt={post.post.name} />
                        </div>
                    }
                    {post.post.thumbnail_url &&
                        <a className={`${styles.image}`} href={post.post.thumbnail_url} target="_blank">
                            <AutoMediaType url={post.post.thumbnail_url} alt={post.post.name} />
                        </a>
                    }
                </div>
                <div className={styles.footer}>
                    <div className={`${styles.votesMobile}`}>
                        <span className={`material-icons ${styles.upvote}`}>arrow_upward</span>
                        <span className={`${styles.votesCount}`}>{post.counts.score}</span>
                        <span className={`material-icons ${styles.downvote}`}>arrow_downward</span>
                    </div>
                    <div className={`${styles.footerInteractions}`}>
                        <button>{post?.counts?.comments > 0 && post?.counts?.comments}<span className="material-icons-outlined">chat_bubble_outline</span></button>
                        <button><span className="material-icons-outlined">share</span></button>
                        <button><span className="material-icons">bookmark_border</span></button>
                        <button><span className="material-icons-outlined">more_horiz</span></button>
                    </div>
                    
                </div>
            </div>

        </div>
        </>
    )
}