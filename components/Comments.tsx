"use client";
import { useState, useRef, FormEvent, useEffect } from "react";
import { ClipLoader, BounceLoader } from "react-spinners";
import {
  CommentResponse,
  CommentSortType,
  CommentView,
  GetCommentsResponse,
  PostView,
} from "lemmy-js-client";
import InfiniteScroll from "react-infinite-scroller";
import Link from "next/link";

import SortButton from "./ui/SortButton";
import MdTextarea from "./ui/MdTextarea";

import { sendComment, getComments } from "@/utils/lemmy";

import { useSession } from "@/hooks/auth";

import Comment from "./Comment";
import WriteCommentOverlay from "./WriteCommentOverlay";

import { DEFAULT_INSTANCE } from "@/constants/settings";

import styles from "@/styles/Pages/PostPage.module.css";
import EndlessScrollingEnd from "./ui/EndlessSrollingEnd";

function Loader() {
  return (
    <div className="mb-10 flex w-full items-center justify-center">
      <BounceLoader color="#e6b0fa" size={20} speedMultiplier={0.75} />
    </div>
  );
}

export default function Comments({
  postId,
  jwt,
  instance,
  setPostData,
  postData,
  commentResponse,
}: {
  postId: number;
  jwt?: string;
  instance?: string;
  setPostData: (postData: PostView) => void;
  postData: PostView;
  commentResponse?: CommentResponse;
}) {
  const { session } = useSession();

  const [commentsData, setCommentsData] = useState<GetCommentsResponse>(
    {} as GetCommentsResponse,
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [replyLoading, setReplyLoading] = useState<boolean>(false);
  const [replyComment, setReplyCommet] = useState<CommentView>(
    {} as CommentView,
  );
  const [replyCommentText, setReplyCommentText] = useState<string>("");

  const [showReply, setShowReply] = useState<boolean>(false);

  const [currentCommentsPage, setCurrentCommentsPage] = useState<number>(1);
  const [currentCommentSort, setCurrentCommentSort] = useState<CommentSortType>("Hot");
  const [forceCommentUpdate, setForceCommentUpdate] = useState<number>(0);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(true);
  const [hasMoreComments, setHasMoreComments] = useState<boolean>(true);


  // commentReplyMode
  const [parentId, setParentId] = useState<number | undefined>(undefined);

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

  // Try to get comments from localStorage
  useEffect(() => {
    if (commentResponse) return;
    const localStorageComments = localStorage.getItem("comments");
    if (localStorageComments) {
      const parsed = JSON.parse(localStorageComments);
      if (parsed.postId == postId) {
        setCommentsData({ comments: parsed.comments });
      }
    }
  }, []);

  // Save comments to localStorage every 500ms when loaded new Comments
  useEffect(() => {
    if (commentResponse) return;
    const timer = setTimeout(() => {
      if (!commentsData?.comments) return;
      localStorage.setItem(
        "comments",
        JSON.stringify({
          postId: postData?.post?.id,
          comments: commentsData?.comments,
        }),
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [commentsData]);

  useEffect(() => {
    setCommentsData({} as GetCommentsResponse);
    setCurrentCommentsPage(1);
  }, [currentCommentSort])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setReplyLoading(true);

    if (!jwt || !postId || replyCommentText?.length < 1) return;

    const comment = await sendComment({
      content: replyCommentText,
      post_id: postId,
      parent_id: replyComment?.comment?.id,
      auth: jwt,
    });

    if (!comment) return alert("Something went wrong");

    const oldComments = commentsData.comments;
    const newComments = [comment, ...oldComments];
    setCommentsData({ ...commentsData, comments: newComments });

    const oldPostData = postData;
    const newPostData = {
      ...oldPostData,
      post_view: {
        ...oldPostData,
        post: {
          ...oldPostData.post,
          num_comments: oldPostData.counts.comments + 1,
        },
      },
    };
    setPostData(newPostData);

    setReplyCommentText("");
    setShowReply(false);

    setReplyLoading(false);
  };

  useEffect(() => {
    if (commentResponse) {
      console.log("Comment response mode", commentResponse);
      setReplyCommet(commentResponse.comment_view);
      setCommentsData({ comments: [commentResponse.comment_view] });
      return;
    }
    handleLoadMoreComments();
  }, [forceCommentUpdate, instance, session.pendingAuth]);

  useEffect(() => {
    // load parent comment if reply is set
    const path = commentResponse?.comment_view?.comment?.path.split(".");
    if (path) {
      const parentId = path[path.length - 2];
      setParentId(parseInt(parentId));
    }
  }, [commentResponse]);

  const handleLoadMoreComments = async () => {
    if (session?.pendingAuth) return;
    if (!postData?.post?.id) return;
    if (!hasMoreComments) return;
    if (commentResponse) return;

    setCommentsLoading(true);

    const data = await getComments(
      {
        post_id: postData.post.id,
        sort: currentCommentSort,
        page: currentCommentsPage,
        auth: session.currentAccount?.jwt,
      },
      instance || DEFAULT_INSTANCE,
    );

    if (data) {
      setCommentsLoading(false);

      if (data.comments.length == 0) return setHasMoreComments(false);

      // Has old data
      if (commentsData?.comments?.length > 0) {
        const oldData = commentsData;
        const newData = [...oldData.comments, ...data.comments];

        // filter out removed comments and only get top-level comments
        const filtered = newData.filter(
          (c) =>
            !c.comment.removed &&
            !c.comment.deleted &&
            c.comment.path.split(".")[1] == c.comment.id.toString(),
        );

        // filter out duplicates
        const uniqueComments = filtered.filter((c, index) => {
          return filtered.findIndex((c2) => c2.comment.id == c.comment.id) == index;
        })

        if (uniqueComments.length == 0) {
          console.warn(
            "Lemmy wasted resources again! This message is shown every time Lemmy sends a stupid response.",
          );
          //setHasMoreComments(false);
        }

        setCommentsData({
          ...oldData,
          comments: uniqueComments,
        });
      }
      // No old data => just set new data
      else {
        setCommentsData(data);
      }
      setCurrentCommentsPage(currentCommentsPage + 1);
    } else {
      //setHasMoreComments(false);
    }
    setCommentsLoading(false); // For all cases
  };

  return (
    <>
      <div id="comments" className={`flex w-full flex-col items-center gap-2`}>
        {/* desktop comments textarea */}
        <form
          onSubmit={(e) => handleSubmit(e)}
          className={`${styles.textarea} bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50  max-w-3xl max-md:w-full max-sm:p-2`}
        >
          <MdTextarea 
            defaultValue={replyCommentText}
            onChange={(newText) => setReplyCommentText(newText)}
            placeholder="What are your thoughts?..."
          />
          {replyLoading ? (
            <ClipLoader color="#487be0" loading={true} size={25} />
          ) : (
            <button
              type="submit"
              className="m-3 flex items-center gap-2 text-blue-500"
            >
              Post Comment
              <span className="material-symbols-outlined">send</span>
            </button>
          )}
        </form>

        {/* mobile comments button => opens WriteCommentOverlay */}
        <button
          onClick={() => setShowReply(true)}
          className={` invisible fixed bottom-0 flex w-full items-center justify-center border-neutral-700 bg-neutral-50 p-4 px-2 shadow-lg dark:border-t dark:bg-neutral-950 max-md:visible `}
          style={{ zIndex: "40" }}
        >
          <div
            className={` flex w-full items-center justify-start rounded-lg bg-neutral-200 p-4 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300`}
          >
            <span>What are your thoughts?</span>
          </div>
        </button>

        <WriteCommentOverlay
          post={postData}
          comment={replyComment}
          show={showReply}
          setShow={setShowReply}
          allComments={commentsData}
          setPost={setPostData}
          setComments={setCommentsData}
        />

        <div
          className={`${styles.comments} mb-24 max-w-3xl max-md:w-full max-sm:p-2 relative`}
        >
          {commentsData?.comments?.length > 0 && (
            <SortButton 
              type="comment" defaultOption={currentCommentSort}
              onChange={(sort) => setCurrentCommentSort(sort as CommentSortType)}
            />
          )}

          {/* Comments  */}
          {commentResponse ? (
            <div className={`${styles.commentsList}`}>
              <Link
                href={`/post/${postData?.post?.id}/comment/${parentId}`}
                shallow
                className="a"
              >
                <button className="flex items-center gap-1">
                  <span className="material-symbols-outlined">read_more</span>
                  <span>Load Context</span>
                </button>
              </Link>
              {commentsData?.comments?.map((comment, index) => (
                <Comment
                  commentView={comment}
                  allComments={commentsData.comments}
                  key={index}
                  commentReplyMode
                  setReplyComment={setReplyCommet}
                  setShowReply={setShowReply}
                />
              ))}
            </div>
          ) : (
            <>
              <InfiniteScroll
                className={`${styles.commentsList}`}
                pageStart={1}
                hasMore={hasMoreComments}
                loadMore={async () => await handleLoadMoreComments()}
                loader={<Loader key="loader" />}
              >
                {commentsData?.comments
                  ?.filter(
                    (c) =>
                      c.comment.path.split(".")[1] == c.comment.id.toString(),
                  )
                  .map((comment, index) => (
                    <Comment
                      commentView={comment}
                      allComments={commentsData.comments}
                      key={index}
                      setReplyComment={setReplyCommet}
                      setShowReply={setShowReply}
                    />
                  ))}
                {!hasMoreComments && commentsData?.comments?.length > 0 && (
                  <EndlessScrollingEnd key={"end"} />
                )}
              </InfiniteScroll>
            </>
          )}

          {commentsData?.comments?.length == 0 && !commentsLoading && (
            <div className="mb-10 flex w-full items-center justify-center">
              <button
                onClick={() => setForceCommentUpdate(forceCommentUpdate + 1)}
              >
                <span className="material-symbols-outlined">refresh</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
