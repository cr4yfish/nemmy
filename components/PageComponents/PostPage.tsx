"use client"

import React, {  useEffect, useState } from "react";
import { GetPostResponse, PostView } from "lemmy-js-client";
import Link from "next/link";
import { motion } from "framer-motion";

import { useNavbar } from "@/hooks/navbar";

import { AutoMediaType } from "@/utils/AutoMediaType";
import { restoreScrollPos } from "@/utils/scrollPosition";

import styles from "@/styles/Pages/PostPage.module.css";
import markdownStyle from "@/styles/util/markdown.module.css";

import { FormatDate } from "@/utils/formatDate";

import Username from "@/components/User/Username";
import Vote from "@/components/Vote";
import RenderMarkdown from "@/components/ui/RenderMarkdown";
import Comments from "../Comments";
import Image from "next/image";
import { DEFAULT_AVATAR } from "@/constants/settings";

export default function PostPage({ data, instance, jwt, shallow } :  { data?: PostView, instance?: string, jwt?: string, shallow?: boolean }) {
    const { navbar, setNavbar } = useNavbar();

    const [postData, setPostData] = useState<PostView>(data || {} as PostView);

    useEffect(() => {
        const localStoragePost = localStorage.getItem("currentPost");

        if(localStoragePost) {
            setPostData(JSON.parse(localStoragePost));

            // pathname is like /post/id?preload=true
            // we want to remove the ?preload=true part
            const pathname = window.location.pathname.split("?")[0];
            history.replaceState({}, "", pathname);
        }
        setNavbar({ ...navbar!, showSort: false, showFilter: false, 
            showSearch: false, showback: false, hidden: false, titleOverride: "" 
        })
    }, [])

    return (
        <>
        <motion.div 
            id="post"
            className={`${styles.pageWrapper} mt-24`}
            initial={{ opacity: 0, x: shallow ? 1000 : 0 }}
            animate={{ opacity: 1, x: 0, transition: { bounce: 0.1} }}
            exit={{ opacity: 0, x: shallow ? 1000 : 0 }}
            >
            <div className={`${styles.wrapper}`}>
                <div className={`${styles.post}`}>
                    <div className={`${styles.postHeader}`}>
                        <div className={`${styles.postHeaderMetadata}`}>

                            { postData?.community?.actor_id &&
                            <Link href={`/c/${postData?.community?.name}@${new URL(postData?.community.actor_id).host}`}>
                                <div className={`${styles.communityImage}`}>
                                    <Image width={50} height={50} alt="" src={postData?.community.icon || DEFAULT_AVATAR} />
                                </div>
                            </Link>
                            }

                            <div className={`${styles.postHeaderMetadataContent}`}>

                                { postData?.community?.actor_id &&
                                <Link href={`/c/${postData?.community?.name}@${new URL(postData?.community?.actor_id).host}`}>
                                    <span>c/{postData?.community?.name}</span>
                                </Link>
                                }
                                
                                <span className={`${styles.postHeaderMetadataContentUsername}`}>
                                    <span className="max-sm:hidden">Posted by</span>
                                    <Username user={postData?.creator} baseUrl="" />
                                    <div className="dividerDot"></div>
                                    <span className="text-neutral-400 text-xs"><FormatDate date={new Date(postData?.post?.published)} /></span>
                                    <div className="dividerDot"></div>
                                    <span className="text-neutral-400 text-xs">{postData?.post?.ap_id && new URL(postData.post.ap_id).host}</span>
                                </span>
                            </div>

                        </div>
                        <div className={`${styles.postHeaderTitle}`}>
                            <h1>{postData?.post?.name}</h1>
                        </div>
                    </div>

                    <div className={`${styles.postContent}`}>

                        {/* Display Media e.g. Image, Video, Gif */ }
                        { (postData?.post?.url || postData?.post?.embed_video_url) && !postData?.post?.url?.endsWith(".html") &&
                        <div className={`${styles.postBodyMedia}`}>
                            {postData?.post?.url && <AutoMediaType url={postData?.post?.url} />}
                            {postData?.post?.embed_video_url && <AutoMediaType url={postData?.post?.embed_video_url} />}
                        </div>
                        }

                        {/* Display Embed thumbnail with Link e.g. Article */ }
                        { (postData?.post?.embed_title || postData?.post?.url?.endsWith(".html")) &&
                            <div className={`${styles.postBodyEmbed}`}>
                                <div>
                                    <div className={`${styles.postBodyEmbedTitle}`}>{postData?.post?.embed_title}</div>
                                    <div className={`${styles.postBodyEmbedDescription}`}>{postData?.post?.embed_description}</div>
                                </div>
                                
                                {postData?.post?.thumbnail_url && <div className={`${styles.postBodyEmbedImage}`}><Image height={500} width={500} src={postData?.post?.thumbnail_url} alt="" /></div>}
                                
                                {postData?.post?.url && 
                                    <Link className="a" href={postData?.post?.url} target="_blank" rel="noreferrer">
                                        {postData?.post?.url}
                                    </Link>
                                }
                            </div>
                        }

                        {/* The Text Body rendered in Markdown */ }
                        {postData?.post?.body && <div className={`${styles.postContentText} ${markdownStyle.markdown}`}><RenderMarkdown>{postData?.post?.body}</RenderMarkdown></div>}
                        
                    </div>

                    <div className={`${styles.postInteractions}`}>
                        {postData?.counts && <Vote post={postData} horizontal />}
                        <div className={`${styles.interaction}`}><span className="material-icons">chat_bubble_outline</span>{postData?.counts?.comments}</div>
                        <div className={`${styles.interaction}`}><span className="material-icons">more_vert</span></div>
                    </div>
                </div>

      
               
            </div>

        </motion.div>

        { postData?.post?.id &&
            <Comments 
                postId={postData?.post?.id}
                instance={instance} jwt={jwt}
                postData={postData} setPostData={setPostData}
            />
        }

        </>
    )
}