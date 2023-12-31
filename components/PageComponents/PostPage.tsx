"use client";

import React, { useEffect, useState } from "react";
import { CommentResponse, PostView } from "lemmy-js-client";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

import { AutoMediaType } from "@/utils/AutoMediaType";

import styles from "@/styles/Pages/PostPage.module.css";
import markdownStyle from "@/styles/util/markdown.module.css";

import { FormatDate } from "@/utils/formatDate";

import Username from "@/components/User/Username";
import Vote from "@/components/Vote";
import RenderMarkdown from "@/components/ui/RenderMarkdown";
import Comments from "../Comments";
import Poll from "../Poll";


import { DEFAULT_AVATAR } from "@/constants/settings";

export default function PostPage({
  data,
  instance,
  jwt,
  shallow,
  postId,
  commentResponse,
  postInstance,
}: {
  data?: PostView;
  instance?: string;
  jwt?: string;
  shallow?: boolean;
  postId: number;
  commentResponse?: CommentResponse;
  postInstance?: string;
}) {
  const [postData, setPostData] = useState<PostView>(data || ({} as PostView));
  const [isPoll, setIsPoll] = useState<boolean>(false);

  useEffect(() => {
    postData?.post?.name &&
      setIsPoll(postData?.post.name.toLowerCase().includes("[poll]"));
  }, [data]);

  return (
    <>
      <motion.div
        id="post"
        className={`${styles.pageWrapper} mt-24`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { bounce: 0.1 } }}
        exit={{ opacity: 0 }}
      >
        <div className={`${styles.wrapper}`}>
          <div className={`${styles.post}`}>
            <div className={`${styles.postHeader}`}>
              <div className={`${styles.postHeaderMetadata}`}>
                {postData?.community?.actor_id && (
                  <Link
                    href={`/c/${postData?.community?.name}@${
                      new URL(postData?.community.actor_id).host
                    }`}
                  >
                    <Image
                      className={`${styles.communityImage}`}
                      width={50}
                      height={50}
                      alt=""
                      src={postData?.community.icon || DEFAULT_AVATAR}
                    />
                  </Link>
                )}

                <div className={`${styles.postHeaderMetadataContent}`}>
                  {postData?.community?.actor_id && (
                    <Link
                      href={`/c/${postData?.community?.name}@${
                        new URL(postData?.community?.actor_id).host
                      }`}
                    >
                      <span className="text-xs capitalize font-bold">
                        {postData?.community?.name}
                      </span>
                    </Link>
                  )}

                  <span
                    className={`${styles.postHeaderMetadataContentUsername} text-xs`}
                  >
                    <div className=" flex flex-row items-center gap-1">
                      <span className="max-sm:hidden text-neutral-700 dark:text-neutral-400">Posted by</span>
                      <Username user={postData?.creator} instance="" />
                    </div>

                    <div className="dividerDot"></div>
                    <span className="text-xs text-neutral-400">
                      <FormatDate date={new Date(postData?.post?.published)} />
                    </span>
                    <div className="dividerDot"></div>
                    <span className="text-xs text-neutral-400">
                      {postData?.community.actor_id &&
                        new URL(postData.community.actor_id).host}
                    </span>
                  </span>
                </div>
              </div>
              <div className={`${styles.postHeaderTitle}`}>
                <h1>
                  <RenderMarkdown content={postData?.post?.name.replace("[POLL]", "")} />
                </h1>
              </div>
            </div>

            <div className={`${styles.postContent}`}>
              {/* Display Media e.g. Image, Video, Gif */}
              {postData?.post?.url &&
                !postData?.post?.url?.endsWith(".html") && (
                  <div id="image" className={`${styles.postBodyMedia}`}>
                    {postData?.post?.url && (
                      <Link href={postData.post.url} className="a">
                        <AutoMediaType url={postData?.post?.url} />
                      </Link>
                    )}
                  </div>
                )}

              {postData?.post?.embed_video_url && (
                <div id="video" className={`${styles.postBodyMedia}`}>
                  {postData?.post?.embed_video_url && (
                    <AutoMediaType url={postData?.post?.embed_video_url} />
                  )}
                </div>
              )}

              {/* Display Embed thumbnail with Link e.g. Article */}
              {(postData?.post?.embed_title ||
                postData?.post?.url?.endsWith(".html")) && (
                <div
                  className={`${styles.postBodyEmbed} border-neutral-300 dark:border-neutral-600`}
                >
                  <div>
                    <div className={`${styles.postBodyEmbedTitle}`}>
                      {postData?.post?.embed_title}
                    </div>
                    <div className={`${styles.postBodyEmbedDescription}`}>
                      {postData?.post?.embed_description}
                    </div>
                  </div>

                  {postData?.post?.thumbnail_url && (
                    <div className={`${styles.postBodyEmbedImage}`}>
                      <Image
                        height={500}
                        width={500}
                        src={postData?.post?.thumbnail_url}
                        alt=""
                      />
                    </div>
                  )}

                  {postData?.post?.url && (
                    <Link
                      className="a"
                      href={postData?.post?.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {postData?.post?.url}
                    </Link>
                  )}
                </div>
              )}

              {/* The Text Body rendered in Markdown */}
              {postData?.post?.body && (
                <div
                  className={`${styles.postContentText} ${markdownStyle.markdown}`}
                >
                  <RenderMarkdown content={postData?.post?.body} />
                </div>
              )}
            </div>

            {/* Has a poll */}
            {isPoll && (
              <Poll post={postData} />
            )}

            <div className={`${styles.postInteractions}`}>
              {postData?.counts && <Vote post={postData} horizontal />}
              <div className={`${styles.interaction}`}>
                <span className="material-symbols-outlined">
                  chat_bubble_outline
                </span>
                {postData?.counts?.comments}
              </div>
              <div className={`${styles.interaction}`}>
                <span className="material-symbols-outlined">more_vert</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {postData?.post?.id && (
        <Comments
          postId={postData?.post?.id}
          postData={postData}
          setPostData={setPostData}
          commentResponse={commentResponse}
        />
      )}
    </>
  );
}
