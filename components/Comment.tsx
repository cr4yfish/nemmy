"use client";
import {
  CommentId,
  CommentSortType,
  CommentView,
  GetCommentsResponse,
  PostId,
} from "lemmy-js-client";
import React, {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useRef,
} from "react";
import useSWR from "swr";

import RenderMarkdown from "./ui/RenderMarkdown";
import Vote from "./Vote";
import Username from "./User/Username";
import BookmarkButton from "./ui/BookmarkButton";
import MdTextarea from "./ui/MdTextarea";

import { useSession } from "@/hooks/auth";

import { FormatDate } from "@/utils/formatDate";
import { sendComment } from "@/utils/lemmy";

async function fetcher(url: string) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}

// Tailwind colors for comment chain colors
const colors = [
  "bg-red-300",
  "bg-orange-300",
  "bg-amber-300",
  "bg-yellow-300",
  "bg-lime-300",
  "bg-green-300",
  "bg-emerald-300",
  "bg-teal-300",
  "bg-cyan-300",
  "bg-lightBlue-300",
  "bg-blue-300",
  "bg-indigo-300",
  "bg-violet-300",
  "bg-purple-300",
  "bg-fuchsia-300",
  "bg-pink-300",
  "bg-rose-300",
];

import styles from "@/styles/Comment.module.css";
import RenderFormattingOptions from "./ui/RenderFormattingOptions";

export default function Comment({
  commentView,
  allComments,
  depth = 0,
  setReplyComment,
  setShowReply,
  commentReplyMode = false,
}: {
  commentView: CommentView;
  allComments: CommentView[];
  depth?: number;
  setReplyComment: Dispatch<SetStateAction<CommentView>>;
  setShowReply: React.Dispatch<React.SetStateAction<boolean>>;
  commentReplyMode?: boolean;
}) {
  const { session } = useSession();
  const [children, setChildren] = useState<CommentView[]>([]);
  const [childrenHidden, setChildrenHidden] = useState(false);
  const [showDesktopReply, setShowDesktopReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);

  const { data, error } = useSWR(
    `/api/getComments?post_id=${commentView.comment.post_id}&parent_id=${commentView.comment.id}&sort=Top&page=1&auth=${session.currentAccount?.jwt}`,
    fetcher,
  );

  // Adjust textarea height to content on user input
  useEffect(() => {
    const textarea = textareaRef.current;

    function adjustHeight() {
      if (!textarea) return;
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }

    textarea?.addEventListener("input", adjustHeight);
    adjustHeight();

    // Cleanup on onmount
    return () => {
      textarea?.removeEventListener("input", adjustHeight);
    };
  }, []);

  // Load children from api
  useEffect(() => {
    if (!data) return; // No data yet
    if (loaded) return; // Already loaded children
    if (children.length > 0) return; // Already loaded children
    if (loading) return; // Already loading children
    if (depth > 3) return; // TODO Load more comments button
    if (session.pendingAuth) return; // Session not loaded yet
    setLoading(true);

    try {
      const comments = data as GetCommentsResponse;
      if (!comments || !comments.comments)
        throw new Error("No comments returned from api");

      // Remove duplicates from self
      comments.comments = comments.comments.filter((c, index) => {
        return (
          comments.comments.findIndex(
            (c2) => c2.comment.id === c.comment.id,
          ) === index
        );
      });

      // Remove duplicates from all comments
      comments.comments = comments.comments.filter((c) => {
        return (
          allComments.findIndex((c2) => c2.comment.id === c.comment.id) === -1
        );
      });

      // Children are only direct children of the comment,
      // which means their ID is right after the commentView.comment.id in the path (e.g. 1.2)
      // So a path like (1.3.2) is not a child of (1.3)

      // Path of the comment we are viewing => parent path
      const path = commentView.comment.path.split(".");

      // Filter out comments that are not direct children
      comments.comments = comments.comments.filter((c) => {
        const childPath = c.comment.path.split(".");

        // Index of the parent in the childPath
        const parentIndex = childPath.findIndex(
          (p) => p === path[path.length - 1],
        );

        // Index of current comment in the childPath
        const currentIndex = childPath.findIndex(
          (p) => p === c.comment.id.toString(),
        );

        // If the parent is not in the childPath, it's not a direct child
        if (parentIndex === -1) return false;

        // If the current comment is not right after the parent, it's not a direct child
        if (currentIndex !== parentIndex + 1) return false;

        return true;
      });

      setChildren(
        comments?.comments?.filter(
          (c) => c.comment.id !== commentView.comment.id,
        ),
      );
    } catch (e) {
      console.error(e);
    }
    setLoaded(true);
    setLoading(false);
  }, [data]);

  const handleToggleChildren = () => {
    children.length > 0 ? setChildrenHidden(!childrenHidden) : null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session.currentAccount || session.pendingAuth) return;
    if (!replyText) return;
    if (!commentView?.comment) return;

    const response = await sendComment({
      auth: session.currentAccount.jwt,
      content: replyText,
      parent_id: commentView.comment.id,
      post_id: commentView.comment.post_id,
    });

    if (!response) {
      console.error("Error sending comment");
      return;
    }
  };

  const handleReply = () => {
    if (window?.innerWidth > 768) {
      setShowDesktopReply(!showDesktopReply);
    } else {
      setReplyComment(commentView);
      setShowReply(true);
    }
  };

  return (
    <>
      <div className={`${styles.wrapper} h-fit`}>
        <div className={`${styles.header}`}>
          {commentView.comment.deleted || commentView.comment.removed ? (
            <div className="">[removed]</div>
          ) : (
            <>
              <div className={`${styles.username}`}>
                <Username user={commentView?.creator} baseUrl="" />
              </div>
              <div className="dividerDot"></div>
              <span className={`${styles.date}`}>
                <FormatDate date={new Date(commentView?.comment?.published)} />
              </span>
            </>
          )}
        </div>

        <div className={`${styles.body}`}>
          <div
            className={`${styles.chainlineWrapper} `}
            onClick={() => handleToggleChildren()}
          >
            <div className={`${styles.chainlineLine} ${colors[depth]}`}></div>
          </div>
          <div className={`${styles.content}`}>
            <div className={`${styles.comment}`}>
              <div className={`${styles.commentText} `}>
                {commentView.comment.deleted || commentView.comment.removed ? (
                  <div className="text-red-400">
                    This comment has been removed
                  </div>
                ) : (
                  <RenderMarkdown content={commentView?.comment?.content} />
                )}
              </div>
              <div
                className={`${styles.commentInteractions} text-sm text-neutral-700 dark:text-neutral-300`}
              >
                <Vote comment={commentView} isComment horizontal />
                <div className="flex flex-row items-center gap-4 ">
                  <button
                    onClick={() => handleReply()}
                    className={`${styles.interaction}`}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "1.25rem" }}
                    >
                      chat_bubble_outline
                    </span>
                    Reply
                  </button>
                  {session?.currentAccount?.jwt && (
                    <BookmarkButton
                      type="comment"
                      id={commentView.comment.id}
                      auth={session.currentAccount.jwt}
                      instance={session.currentAccount.instance}
                      initState={commentView.saved}
                    />
                  )}
                  <div className={`${styles.interaction}`}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "1.25rem" }}
                    >
                      more_vert
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {showDesktopReply && (
              <form
                onSubmit={handleSubmit}
                className=" relative flex flex-col items-end overflow-hidden rounded-lg p-4 dark:bg-neutral-900 dark:text-neutral-50 max-md:hidden"
              >
                <button
                  onClick={() => setShowDesktopReply(false)}
                  className="absolute right-5 top-5 flex items-center justify-center text-red-400"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
                <MdTextarea
                  placeholder="Write a reply..."
                  defaultValue={replyText}
                  onChange={(newText) => setReplyText(newText)}
                />
                <button
                  type="submit"
                  className="m-3 flex items-center gap-2 text-blue-500"
                >
                  <span>Reply</span>
                  <span className="material-symbols-outlined">send</span>
                </button>
              </form>
            )}

            {!childrenHidden && (
              <div className="flex flex-col gap-0">
                {children?.map((comment, index) => (
                  <Comment
                    commentView={comment}
                    allComments={allComments}
                    key={index}
                    depth={depth + 1}
                    setReplyComment={setReplyComment}
                    setShowReply={setShowReply}
                  />
                ))}
              </div>
            )}
            {childrenHidden && children.length > 0 && (
              <div onClick={() => handleToggleChildren()}>
                <div
                  className={`flex w-full items-center gap-1 rounded-lg p-2 text-sm dark:bg-neutral-800`}
                >
                  <span className={`material-symbols-outlined text-sm`}>
                    expand_more
                  </span>
                  Tap to see {children.length}{" "}
                  {children.length == 1 ? "comment" : "comments"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
