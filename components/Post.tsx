import Image from "next/image";
import { PostView } from "lemmy-js-client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import Username from "./User/Username";
import Vote from "./Vote";
import RenderMarkdown from "./ui/RenderMarkdown";

import { FormatDate } from "@/utils/formatDate";
import { FormatNumber } from "@/utils/helpers";
import { AutoMediaType, isImageType } from "@/utils/AutoMediaType";

import styles from "../styles/post.module.css";
import BookmarkButton from "./ui/BookmarkButton";
import { DEFAULT_INSTANCE } from "@/constants/settings";

export default function Post({
  post,
  onClick = () => null,
  instance,
  auth,
  postInstance,
  style="modern",
  showCommunity=true
}: {
  post: PostView;
  onClick?: () => void;
  instance?: string;
  auth?: string;
  postInstance?: string;
  style?: "modern" | "compact",
  showCommunity?: boolean;
}) {
  if (!post) throw new Error("Post is undefined");

  const hasMedia = post.post.embed_video_url || post.post.thumbnail_url;

  const baseUrl = new URL(post.community.actor_id).hostname;
  // https://lemmy.ml/post/1681855
  //
  //const postUrl = `https://${baseUrl}/post/${post.post.id}`;

  const postUrl = `/post/${post.post.id}?instance=${
    postInstance || new URL(DEFAULT_INSTANCE).host
  }&preload=true`;

  switch(style) {
    case "modern":
      return (
        <>
          <div
            className={`card ${styles.wrapper} gap-4 flex-row items-start justify-start `}
            key={post.post.id}
            id={`${post.post.id.toString()}@${baseUrl}`}
          >
            <div className="max-md:hidden">
              <Vote post={post} />
            </div>

            <div className={`${styles.rightSide}`}>
              <div className={`${styles.header}`}>
                <div className={`${styles.headerContent}`}>
                  <div className={`${styles.headerMetadata}`}>

                    {showCommunity && (
                    <Link
                      href={`/c/${post?.community?.name}@${
                        new URL(post.post.ap_id).host
                      }`}
                      target="_blank"
                      className={`${styles.communityImage}`}
                      style={{ width: "50px", height: "50px" }}
                    >
                      {post?.community?.icon ? (
                        <Image
                          src={post?.community?.icon}
                          alt=""
                          height={40}
                          width={40}
                          className=" h-full w-full overflow-hidden object-cover"
                          style={{ borderRadius: "50%" }}
                        />
                      ) : (
                        <div className={`${styles.communityIconFill} bg-neutral-300 dark:bg-neutral-800 rounded-full`}></div>
                      )}
                    </Link>
                    )}
                    <div className={`flex flex-col gap-0`}>
                        <Link 
                          href={`/c/${post?.community?.name}@${new URL(post.post.ap_id).host}`} 
                          className="flex flex-row gap-1 items-center prose dark:prose-invert"
                          target="_blank"
                          >
                            {showCommunity && (
                            <>
                            <span className="font-bold capitalize">
                              {post.community.name}
                            </span>
                            

                            <span className="font-light text-xs w-fit flex gap-0">
                              <span>@</span> 
                              <span className=" text-neutral-700 dark:text-neutral-400 ">{new URL(post.post.ap_id).host}</span>
                            </span>
                            </>
                            )}
                        </Link>
                        <div className="">
                          <div className={`${styles.user} text-neutral-500 dark:text-neutral-400`}>
                            <Username user={post.creator} baseUrl={baseUrl} />
                            <div className="dividerDot"></div>
                            <div className={`${styles.date}`}>
                              <FormatDate date={new Date(post.post.published)} />
                            </div>
                            {(post.post.featured_local || post.post.featured_community) && (
                              <span className="material-symbols-outlined text-sm text-green-500">
                                push_pin
                              </span>
                            )}
                          </div>                      
                        </div>

                    </div>
                  </div>

                  <Link
                    onClick={onClick}
                    href={postUrl}
                    target="_blank"
                    shallow
                    className={`${styles.headerTitle}`}
                  >
                    <h2 className={`${styles.title} text-neutral-900 dark:text-neutral-100 text-xl`}>{post.post.name}</h2>
                  </Link>

                  {post?.post?.nsfw && (
                    <span className=" w-fit rounded-full bg-red-400 p-2 py-1 text-xs font-bold text-red-950">
                      NSFW
                    </span>
                  )}
                </div>
              </div>

              <div className={`${styles.content}`}>
                
                {/* Display Overlay if post has no media */}
                {!post?.post?.embed_title && // 100% dont display content overlay
                  !post?.post?.url?.endsWith(".html") && // 100% dont display content overlay
                  !post.post.thumbnail_url && // maybe display content overlay
                  !(post?.post?.url && isImageType(post?.post?.url)) && ( // dont display
                    <Link
                    href={postUrl}
                    shallow
                    target="_blank"
                      className={`${styles.contentOverlay} bg-gradient-to-b 
                      from-neutral-50/30 to-neutral-50/90
                      dark:from-neutral-900/50 dark:to-neutral-900/90`}
                      style={{ display: hasMedia ? "none" : "block" }}
                    ></Link>
                  )}

                {/* Display Body if post has body and is not a Link */}
                {post?.post?.body &&
                  !(
                    post?.post?.embed_title || post?.post?.url?.endsWith(".html")
                  ) && (
                    <div className={`${styles.body} text-neutral-700 dark:text-neutral-300 mb-2`}>
                      <RenderMarkdown content={post?.post?.body} disableLinks />
                    </div>
                  )}

                {/* Display Link if post has link e.g. Article case */}
                {(post?.post?.embed_title ||
                  post?.post?.url?.endsWith(".html")) && (
                  <div className={`${styles.postBodyEmbed} border-neutral-300 text-neutral-800 dark:border-neutral-600 dark:text-neutral-200`}>
                    <div className="flex flex-col gap-1">
                      <div className={`${styles.postBodyEmbedTitle}`}>
                        {post?.post?.embed_title}
                      </div>
                      <RenderMarkdown
                        className={`${styles.postBodyEmbedDescription}`}
                        content={post?.post?.embed_description} 
                        disableLinks
                      />
                    </div>
                    <div
                      className={`${styles.link} flex w-full items-start justify-start p-1 pl-0`}
                    >
                      {post.post.url && (
                        <Link
                          className="a text-xs"
                          href={post.post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {new URL(post.post.url).hostname}
                        </Link>
                      )}
                    </div>
                    {/* Display Thumbnail */}
                    {post.post.thumbnail_url && (
                      <Link
                        className={`${styles.image}`}
                        href={post.post.thumbnail_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <AutoMediaType
                          url={post.post.thumbnail_url}
                          alt={post.post.name}
                          nsfw={post?.post?.nsfw}
                        />
                      </Link>
                    )}
                  </div>
                )}

                {/* Post has post url and no embedding,thus the url has to link to an Image -> Display Image */}
                {post?.post?.url && !post?.post?.embed_title && (
                  <div className={`${styles.image}`}>
                    <AutoMediaType
                      url={post?.post?.url}
                      alt={post.post.name}
                      nsfw={post?.post?.nsfw}
                    />
                  </div>
                )}

                {/* Display Embed Video */}
                {post.post.embed_video_url && (
                  <div className={`${styles.video}`}>
                    <AutoMediaType
                      url={post.post.embed_video_url}
                      alt={post.post.name}
                      nsfw={post?.post?.nsfw}
                    />
                  </div>
                )}

              </div>

              <div className={`${styles.footer} max-md:justify-between`}>
                <div className="hidden max-md:flex">
                  <Vote post={post} horizontal />
                </div>
                <div className={`${styles.footerInteractions}`}>
                  
                  <button className="text-neutral-400 hover:bg-neutral-100 hover:dark:bg-neutral-900">
                    {post?.counts?.comments > 0 &&
                      FormatNumber(post?.counts?.comments, true)}
                    <span className="material-symbols-outlined">
                      chat_bubble_outline
                    </span>
                  </button>

                  {auth && instance && post.post.id && (
                    <BookmarkButton
                      id={post.post.id}
                      auth={auth}
                      instance={instance}
                      initState={post.saved}
                      onChange={(newState) => (post.saved = newState)}
                      type="post"
                    />
                  )}

                  <button className="text-neutral-400 hover:bg-neutral-100 hover:dark:bg-neutral-900">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      );

    case "compact":
      return (
        <>
          <div  className={`card ${styles.wrapper} flex-col items-start justify-start gap-2 py-2 `}
            key={post.post.id}
            id={`${post.post.id.toString()}@${baseUrl}`}
          >
            <div className={`${styles.headerMetadata} justify-between text-xs text-neutral-700 dark:text-neutral-400`}>

              <div className={`flex flex-row items-center gap-1 max-sm:flex-wrap`}>

                {post?.community?.icon && showCommunity && (
                  <Link
                    href={`/c/${post?.community?.name}@${
                      new URL(post.post.ap_id).host
                    }`}
                    target="_blank"
                    className={`${styles.communityImage}`}
                  >
                    <Image
                      src={post?.community?.icon}
                      alt=""
                      height={20}
                      width={20}
                      className=" h-full w-full overflow-hidden object-cover"
                      style={{ borderRadius: "50%" }}
                    />
                  </Link>
                )}

                {showCommunity && 
                <>
                <Link 
                  href={`/c/${post?.community?.name}@${new URL(post.post.ap_id).host}`} 
                  className="flex flex-col prose dark:prose-invert"
                  target="_blank"
                  >
                    <span className="font-bold capitalize text-xs">
                      {post.community.name}
                    </span>

                    <span className="font-light text-xs w-fit flex gap-0 flex-row items-center">
                      <span>@</span> 
                      <span className=" text-xs ">{new URL(post.post.ap_id).host}</span>
                    </span>
                  
                </Link>

                <div className="dividerDot"></div>
                </>
                }

                <Username user={post.creator} baseUrl={baseUrl} />

                <div className="dividerDot"></div>

                <div className={` text-xs `}>
                  <FormatDate date={new Date(post.post.published)} />
                </div>


                {post.post.nsfw && (
                  <>
                  <div className="dividerDot"></div>
                  <span className=" text-red-400 text-xs font-bold">
                    NSFW
                  </span>
                  </>
                )}


              </div>
              
                {(post.post.featured_local || post.post.featured_community) && (
                  <span className="material-symbols-outlined text-sm text-green-500">
                    push_pin
                  </span>
                )}

            </div>

            <div className={` flex flex-row justify-between items-center w-full`}>

              <div className={` flex flex-col items-start justify-start h-20 w-full relative`}>

                <Link
                  onClick={onClick}
                  href={postUrl}
                  target="_blank"
                  shallow
                  className="h-full w-full flex flex-col items-start justify-start relative"
                >
                  <div className={`${styles.title} text-neutral-900 dark:text-neutral-100 text-sm h-fit w-full z-10`} style={{ overflow: "visible"}}>
                    {post.post.name}
                  </div>
                

                {/* Display Body if post has body and is not a Link */}
                {post?.post?.body && !( post?.post?.embed_title || post?.post?.url?.endsWith(".html")) && (
                  <>
                    <div className="absolute w-full h-full top-0 left-0 bg-gradient-to-b from-neutral-50/30 to-neutral-50/90 dark:from-neutral-900/50 dark:to-neutral-900/90" style={{ zIndex: 2 }}></div>
                    <div className={`${styles.body} text-neutral-700 dark:text-neutral-300 mb-2 text-xs`}>
                      <RenderMarkdown content={post?.post?.body} disableLinks className="text-xs prose-p:m-0" />
                    </div>
                  </>
                )}
                </Link>

              </div>

              {/* Display Image */}
              {post.post.thumbnail_url && (
                <div className=" h-full flex items-center justify-center">
                  <Link
                    className={` overflow-hidden rounded-xl flex`}
                    style={{ height: "80px", width: "80px" }}
                    href={post.post.thumbnail_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <AutoMediaType
                      url={post.post.thumbnail_url}
                      alt={post.post.name}
                      nsfw={post?.post?.nsfw}
                    />
                  </Link>
              
                </div>
               )}
            </div>

            <div className={`${styles.footer} justify-start text-neutral-400`}>

                <div className="flex">
                  <Vote post={post} horizontal />
                </div>
                <div className={`${styles.footerInteractions}`}>
                  <button>
                    {post?.counts?.comments > 0 &&
                      FormatNumber(post?.counts?.comments, true)}
                    <span className="material-symbols-outlined">
                      chat_bubble_outline
                    </span>
                  </button>

                  {auth && instance && post.post.id && (
                    <BookmarkButton
                      id={post.post.id}
                      auth={auth}
                      instance={instance}
                      initState={post.saved}
                      onChange={(newState) => (post.saved = newState)}
                      type="post"
                    />
                  )}

                  <button>
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </div>

            </div>
          </div>
        </>
      );
  }
}
