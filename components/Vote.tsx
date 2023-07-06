"use client";

import { useState } from "react";
import AnimatedNumber from "react-awesome-animated-number";
import "react-awesome-animated-number/dist/index.css";
import { useSession } from "@/hooks/auth";

import styles from "../styles/post.module.css"
import { PostView } from "lemmy-js-client";

export default function Vote({ horizontal=false, post } : { horizontal?: boolean, post: PostView }) {
    const [score, setScore] = useState(post?.counts?.score);
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const { session } = useSession();

    const vote = async (score: number, post_id: number, auth: string) => {
        if(!score || !post_id || !auth) throw new Error("Missing parameters");
        const response = await fetch("/api/votePost", {
            method: "POST",
            body: JSON.stringify({
                post_id: post_id,
                score: score,
                auth: auth
            })
        }).then(res => res.json());
        return response.post_view as PostView;
    }

    const handleLike = async () => {
        if(liked || !session) return;

        disliked ? setScore(score + 2) : setScore(score + 1)

        const response = await vote(1, post.post.id, session.jwt);
        const newVotes = response?.counts?.score;
        setScore(newVotes);

        setDisliked(false);
        setLiked(true);
    }

    const handleDislike = async () => {
        if(disliked || !session) return;

        liked ? setScore(score-2) : setScore(score - 1);

        const response = await vote(-1, post.post.id, session.jwt);
        const newVotes = response?.counts?.score;
        setScore(newVotes);

        setLiked(false);
        setDisliked(true);
    }

    return (
        <>
        <div className={`${horizontal ? styles.votesMobile : styles.votesDesktop}`}>
            <span onClick={() => handleLike()}  className={`material-icons ${styles.upvote} ${liked && "text-fuchsia-400"}`}>arrow_upward</span>
            <span className={`${styles.votesCount}`}>
                <AnimatedNumber 
                    value={score}
                    hasComma={false}
                    size={20}
                    duration={500}
                />
            </span>
            <span onClick={() => handleDislike()} className={`material-icons ${styles.downvote} ${disliked && "text-blue-400"}`}>arrow_downward</span>
        </div>
        </>
    )
}