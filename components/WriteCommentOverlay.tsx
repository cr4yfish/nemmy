/* eslint-disable @next/next/no-img-element */
"use client";
import {
  CommentView,
  GetCommentsResponse,
  GetPostResponse,
  PostView,
} from "lemmy-js-client";
import { useState, FormEvent } from "react";
import { ClipLoader } from "react-spinners";

import { sendComment } from "@/utils/lemmy";

import RenderMarkdown from "@/components/ui/RenderMarkdown";
import Username from "@/components/User/Username";
import MdTextarea from "./ui/MdTextarea";

import { useSession } from "@/hooks/auth";

import styles from "@/styles/ui/WriteCommentOverlay.module.css";
import Image from "next/image";
import { DEFAULT_AVATAR } from "@/constants/settings";

export default function WriteCommentOverlay({
  post,
  comment,
  show,
  setShow,
  allComments,
  setPost,
  setComments,
}: {
  post?: PostView;
  comment?: CommentView;
  show: boolean;
  setShow: (show: boolean) => void;
  allComments?: GetCommentsResponse;
  setPost: (postData: PostView) => void;
  setComments: (
    getCommentsResponse: React.SetStateAction<GetCommentsResponse>,
  ) => void;
}) {
  const [replyCommentText, setReplyCommentText] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const { session } = useSession();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    if (!session.currentAccount) return;
    if (!post) return;
    if (!allComments) return;
    if (replyCommentText.length < 1) return alert("Comment cannot be empty");

    const response = await sendComment({
      content: replyCommentText,
      post_id: post.post?.id,
      parent_id: comment?.comment?.id,
      auth: session.currentAccount.instanceAccounts[0]?.jwt,
    });

    if (!response) return alert("Something went wrong");

    const oldComments = allComments.comments;
    const newComments = [response, ...oldComments];
    setComments({ comments: newComments });

    const oldPostData = post;
    const newPostData = {
      ...oldPostData,
      post_view: {
        ...oldPostData,
        counts: {
          ...oldPostData.counts,
          comments: oldPostData.counts.comments + 1,
        },
      },
    };
    setPost(newPostData);

    setReplyCommentText("");
    setShow(false);
    setLoading(false);
  };

  return (
    <>
      <form
        className={` ${
          show ? styles.showReply : styles.hideReply
        } left-0 top-0 h-screen w-full border-b `}
        style={{ zIndex: "99" }}
        onSubmit={(e) => handleSubmit(e)}
      >
        <div className=" flex flex-row justify-between border-b border-neutral-300 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-950  ">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShow(false)}
              className="flex items-center"
            >
              <span className="material-symbols-outlined text-red-600">
                cancel
              </span>
            </button>
            <span className="font-bold text-neutral-500">Reply</span>
          </div>
          {loading ? (
            <ClipLoader color="#487be0" size={23} />
          ) : (
            <button
              type="submit"
              className="flex items-center gap-2 text-blue-500"
            >
              <span className="font-bold">Post</span>
              <span className="material-symbols-outlined">send</span>
            </button>
          )}
        </div>

        {comment?.comment?.content ? (
          <div className="flex flex-col">
            <div className="flex flex-row">
              <Username user={comment?.creator} instance="" />
            </div>
            <div>
              <RenderMarkdown content={comment?.comment?.content} />
            </div>
          </div>
        ) : (
          <div className="mb-4 flex flex-col overflow-y-auto">
            <div className="flex flex-row items-center">
              <div className="flex flex-row items-center gap-2 p-4">
                <Image
                  height={40}
                  width={40}
                  src={post?.community?.icon || DEFAULT_AVATAR}
                  alt=""
                  className="h-10 w-10 rounded-full"
                />

                {post?.creator && (
                  <div className=" h-full">
                    <span className="font-bold">{post.creator.name}</span>
                    <Username user={post.creator} instance="" />
                  </div>
                )}
              </div>

              <div className="p-2">
                {(post?.post?.thumbnail_url || post?.post?.url) && (
                  <Image
                    height={80}
                    width={80}
                    src={post.post?.thumbnail_url || post.post?.url || ""}
                    className="h-20 w-20 rounded-lg object-contain"
                    alt=""
                  />
                )}
              </div>
            </div>
            <div className=" h-12 p-4">
              {" "}
              {post?.post?.body && <RenderMarkdown content={post.post?.body} />}
            </div>
          </div>
        )}

        <MdTextarea
          placeholder="What are your toughts?..."
          defaultValue={replyCommentText}
          onChange={(newText) => setReplyCommentText(newText)}
        />
      </form>

      <div
        className={`left-0 top-0 h-full w-full bg-neutral-50/50 backdrop-blur-2xl dark:bg-neutral-950/50 ${
          show ? styles.showReply : styles.hideShowReply
        }`}
        style={{ zIndex: "51" }}
      ></div>
    </>
  );
}
