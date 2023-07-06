import Image from "next/image";
import { LemmyHttp, PostView } from "lemmy-js-client";
import ReactMarkdown from 'react-markdown'
import Username from "./User/Username";
import { AutoMediaType } from "@/utils/AutoMediaType";
import Vote from "./Vote";
import Link from "next/link";

import styles from "../styles/post.module.css"
import { useEffect, useState } from "react";
import { useSession } from "@/hooks/auth";
import { animateValue } from "framer-motion";

import markdownStyle from "@/styles/util/markdown.module.css";

export default function Post({ post } : { post: PostView }) {
    const { session } = useSession();

    if(!post) throw new Error("Post is undefined");

    const hasMedia = post.post.embed_video_url || post.post.thumbnail_url;

    const baseUrl = new URL(post.community.actor_id).hostname;
    // https://lemmy.ml/post/1681855
    //
    //const postUrl = `https://${baseUrl}/post/${post.post.id}`;

    const postUrl = `/post/${post.post.id}`;

    return (
        <>
        <div 
            className={`${styles.wrapper}`} key={post.post.id} 
            style={{ height: !hasMedia ? "fit-content" : "unset", cursor: hasMedia ? "unset" : "pointer" }}
        >
            <Vote post={post} />

            <div className={`${styles.rightSide}`}>

                <div className={`${styles.header}`} >
                    <div className={`${styles.votes}`}></div>
                    <div className={`${styles.headerContent}`}>
                        <div className={`${styles.headerMetadata}`}>
                            <Link href={`/c/${post?.community?.name}`}  className={`${styles.communityImage}`}>
                                {post?.community?.icon ?
                                    <img src={post?.community?.icon} alt="" />
                                    :
                                    <div className={`${styles.communityIconFill}`}></div>
                                }
                            </Link>
                            <div className={`${styles.headerMetadataContent}`}>
                                <Link href={`/c/${post?.community?.name}`}  className={`${styles.sub}`}>c/{post.community.name}</Link>
                                <span className={`${styles.dividerDot}`}></span>
                                <div className={`${styles.user}`}>
                                    <div>Posted by</div> 
                                    <Username user={post.creator} baseUrl={baseUrl} /> 
                                    <div className={`${styles.date}`}>on {new Date(post.post.published).toDateString()}</div>
                                </div>
                            </div>
                            
                        </div>
                        <Link href={postUrl}   className={`${styles.headerTitle}`}>
                            <h2 className={`${styles.title}`}>{post.post.name}</h2>
                        </Link>
                        <span className={`${styles.headerLink}`}></span>
                    </div>
                </div>
                <div className={`${styles.content}`}>
                    <div className={`${styles.contentOverlay}`} style={{ display: hasMedia ? "none" : "block" }}></div>
                    {post?.post?.body && <div className={`${styles.body} ${markdownStyle.markdown}`}><ReactMarkdown>{`${post?.post?.body}`}</ReactMarkdown></div> }
                    {post.post.embed_video_url &&
                        <div className={`${styles.video}`}>
                            <AutoMediaType url={post.post.embed_video_url} alt={post.post.name} />
                        </div>
                    }
                    {post.post.thumbnail_url &&
                        <Link className={`${styles.image}`} href={post.post.thumbnail_url} >
                            <AutoMediaType url={post.post.thumbnail_url} alt={post.post.name} />
                        </Link>
                    }
                </div>
                <div className={styles.footer}>
                    <Vote post={post} horizontal />
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