"use client";

import { useEffect, useState } from "react";
import AnimatedNumber from "react-awesome-animated-number";
import "react-awesome-animated-number/dist/index.css";
import { CommentView, PostView } from "lemmy-js-client";
import { useSession } from "@/hooks/auth";

import styles from "../styles/votes.module.css";

export default function Vote({
  horizontal = false,
  post,
  comment,
  isComment,
}: {
  horizontal?: boolean;
  post?: PostView;
  comment?: CommentView;
  isComment?: boolean;
}) {
  const [score, setScore] = useState(
    post?.counts?.score || comment?.counts?.score || 0,
  );
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const { session } = useSession();

  // inital score setting
  useEffect(() => {
    if (isComment && comment) {
      setScore(comment.counts.score);
    } else if (post) {
      setScore(post.counts.score);
    }
  }, [post, comment]);

  // TODO oh god this is horrible, need to change this
  useEffect(() => {
    if (isComment) return;
    if (session.pendingAuth) return;
    if (post?.my_vote === 1) {
      setLiked(true);
    } else if (post?.my_vote === -1) {
      setDisliked(true);
    }
  }, [session, post]);

  useEffect(() => {
    if (!isComment) return;
    if (session.pendingAuth) return;

    if (comment?.my_vote === 1) {
      setLiked(true);
    } else if (comment?.my_vote === -1) {
      setDisliked(true);
    }
  }, [session, comment]);

  const vote = async (score: number, post_id: number, auth?: string) => {
    if (!score || !post_id || !auth) throw new Error("Missing parameters");

    const response = await fetch("/api/votePost", {
      method: "POST",
      body: JSON.stringify({
        post_id: post_id,
        score: score,
        auth: auth,
        isComment: isComment,
      }),
    }).then((res) => res.json());
    return isComment
      ? (response.comment_view as CommentView)
      : (response.post_view as PostView);
  };

  const handleLike = async () => {
    if(!session?.currentAccount) return alert("You must be logged in to vote");
    if (liked) {
      return;
    }

    disliked ? setScore(score + 2) : setScore(score + 1);

    setDisliked(false);
    setLiked(true);

    let id = isComment && comment ? comment.comment.id : false;
    if (!id) id = post ? post.post.id : false;
    if (!id) throw new Error("No id found");

    const response = await vote(1, id, session?.currentAccount?.jwt);
    const newVotes = response?.counts?.score;
    setScore(newVotes);
  };

  const handleDislike = async () => {
    if(!session?.currentAccount) return alert("You must be logged in to vote");
    if (disliked) return;

    liked ? setScore(score - 2) : setScore(score - 1);

    setDisliked(true);
    setLiked(false);

    let id = isComment && comment ? comment.comment.id : false;
    if (!id) id = post ? post.post.id : false;
    if (!id) throw new Error("No id found");

    const response = await vote(-1, id, session.currentAccount.jwt);
    const newVotes = response?.counts?.score;
    setScore(newVotes);
  };

  return (
    <>
      <div
        className={`${horizontal ? styles.votesMobile : styles.votesDesktop}`}
      >
        <span
          onClick={() => handleLike()}
          className={`material-symbols-outlined ${styles.upvote} ${
            liked && "filled text-fuchsia-400"
          }`}
        >
          shift
        </span>
        <span className={`${styles.votesCount}`}>
          <AnimatedNumber
            value={score}
            hasComma={false}
            size={15}
            duration={500}
          />
        </span>
        <span
          onClick={() => handleDislike()}
          className={`material-symbols-outlined rotate-180 ${styles.downvote} ${
            disliked && "filled text-blue-400"
          }`}
        >
          shift
        </span>
      </div>
    </>
  );
}
