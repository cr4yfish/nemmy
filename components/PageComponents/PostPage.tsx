"use client"

import { usePathname } from "next/navigation"; 
import React, {  useEffect, useState } from "react";
import { GetPostResponse } from "lemmy-js-client";
import Link from "next/link";

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

export default function PostPage({ data, instance, jwt } :  { data: GetPostResponse, instance?: string, jwt?: string }) {
    const { navbar, setNavbar } = useNavbar();
    const [postData, setPostData] = useState<GetPostResponse>(data);

    useEffect(() => {
        restoreScrollPos(data.post_view.post.id.toString());
        setNavbar({ ...navbar!, showSort: false, showFilter: false, showSearch: false, showback: false, hidden: false, titleOverride: "" })
    }, [])

    return (
        <>

        <div className={`${styles.pageWrapper} mt-24`}>
            <div className={`${styles.wrapper}`}>
                <div className={`${styles.post}`}>
                    <div className={`${styles.postHeader}`}>
                        <div className={`${styles.postHeaderMetadata}`}>
                            <Link href={`/c/${data.community_view.community.name}@${new URL(data.community_view.community.actor_id).host}`}><div className={`${styles.communityImage}`}><Image width={50} height={50} alt="" src={postData?.post_view?.community?.icon || DEFAULT_AVATAR} /></div></Link>
                            <div className={`${styles.postHeaderMetadataContent}`}>
                                <Link href={`/c/${data.community_view.community.name}@${new URL(data.community_view.community.actor_id).host}`}><span>c/{postData?.post_view?.community?.name}</span></Link>
                                <span className={`${styles.postHeaderMetadataContentUsername}`}>
                                    <span className="max-sm:hidden">Posted by</span>
                                    <Username user={postData?.post_view?.creator} baseUrl="" />
                                    <div className="dividerDot"></div>
                                    <span className="text-neutral-400 text-xs"><FormatDate date={new Date(postData?.post_view?.post?.published)} /></span>
                                    <div className="dividerDot"></div>
                                    <span className="text-neutral-400 text-xs">{new URL(postData.post_view.post.ap_id).host}</span>
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
                                
                                {postData?.post_view?.post?.thumbnail_url && <div className={`${styles.postBodyEmbedImage}`}><Image height={500} width={500} src={postData?.post_view?.post?.thumbnail_url} alt="" /></div>}
                                
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
            instance={instance} jwt={jwt}
            postData={postData} setPostData={setPostData}
        />

        </>
    )
}