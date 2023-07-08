import Image from "next/image";
import { LemmyHttp, PostView } from "lemmy-js-client";
import Username from "./User/Username";
import { AutoMediaType, isImageType } from "@/utils/AutoMediaType";
import Vote from "./Vote";
import Link from "next/link";
import RenderMarkdown from "./ui/RenderMarkdown";

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
            <div className="max-md:hidden"><Vote post={post} /></div>

            <div className={`${styles.rightSide}`}>

                <div className={`${styles.header}`} >
                    <div className={`${styles.headerContent}`}>
                        <div className={`${styles.headerMetadata}`}>
                            <Link href={`/c/${post?.community?.name}`} target="_blank"  className={`${styles.communityImage}`}>
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
                        <Link href={postUrl} target="_blank"  className={`${styles.headerTitle}`}>
                            <h2 className={`${styles.title}`}>{post.post.name}</h2>
                        </Link>
                        <span className={`${styles.headerLink}`}></span>
                    </div>
                </div>
                <div className={`${styles.content}`}>

                    {/* Display Overlay if post has no media */}
                    {   !post?.post?.embed_title && // 100% dont display content overlay
                        !post?.post?.url?.endsWith(".html") && // 100% dont display content overlay
                        !post.post.thumbnail_url &&  // maybe display content overlay
                        !(post?.post?.url && isImageType(post?.post?.url)) && // dont display
                        <div className={`${styles.contentOverlay}`} style={{ display: hasMedia ? "none" : "block" }}></div>
                    }

                    {/* Display Body if post has body and is not a Link */}
                    {post?.post?.body && !(post?.post?.embed_title || post?.post?.url?.endsWith(".html")) && <div className={`${styles.body} ${markdownStyle.markdown}`}><RenderMarkdown>{post?.post?.body}</RenderMarkdown></div> }

                    {/* Display Link if post has link e.g. Article case */}
                    {(post?.post?.embed_title || post?.post?.url?.endsWith(".html")) &&
                        <div className={`${styles.postBodyEmbed}`}>
                            <div className="flex flex-col gap-1">
                                <div className={`${styles.postBodyEmbedTitle}`}>{post?.post?.embed_title}</div>
                                <div className={`${styles.postBodyEmbedDescription}`}>{post?.post?.embed_description}</div>
                            </div>
                           <div className={`${styles.link} flex justify-start items-start w-full p-1 pl-0`}>
                                <a className="a text-xs" href={post.post.url} target="_blank">{post.post.url}</a>
                            </div>
                            {/* Display Thumbnail */}
                            {post.post.thumbnail_url &&
                                <Link className={`${styles.image}`} href={post.post.thumbnail_url} target="_blank" >
                                    <AutoMediaType url={post.post.thumbnail_url} alt={post.post.name} />
                                </Link>
                            }
                        </div>
                        
                    }    

                    { /* Post has post url and no embedding,thus the url has to link to an Image -> Display Image */}
                    { post?.post?.url && !post?.post?.embed_title &&
                        <div className={`${styles.image}`}>
                            <AutoMediaType url={post?.post?.url} alt={post.post.name} />
                        </div>
                    }

                    {/* Display Embed Video */}
                    {post.post.embed_video_url &&
                        <div className={`${styles.video}`}>
                            <AutoMediaType url={post.post.embed_video_url} alt={post.post.name} />
                        </div>
                    }

                    
                </div>
                <div className={styles.footer}>
                    <div className="hidden max-md:flex"><Vote post={post} horizontal /></div> 
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