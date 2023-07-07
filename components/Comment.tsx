import { CommentView, GetCommentsResponse } from "lemmy-js-client"
import React, { useState, useEffect } from "react"
import RenderMarkdown from "./ui/RenderMarkdown"

import Username from "./User/Username"

// Tailwind colors for comment chain colors
const colors = ["bg-red-300", "bg-orange-300", "bg-amber-300", "bg-yellow-300", "bg-lime-300", "bg-green-300", 
    "bg-emerald-300", "bg-teal-300", "bg-cyan-300", "bg-lightBlue-300", "bg-blue-300", "bg-indigo-300", "bg-violet-300", "bg-purple-300", "bg-fuchsia-300", "bg-pink-300", "bg-rose-300"]

import styles from "@/styles/Comment.module.css"

export default function Comment({ commentView, allComments, depth=0 }: { commentView: CommentView, allComments: CommentView[], depth?: number }) {

    const [children, setChildren] = useState<CommentView[]>([]);
    const [childrenHidden, setChildrenHidden] = useState(false);
    const [childrenError, setChildrenError] = useState(true);

    // Load children from api
    useEffect(() => {
        if(!childrenError) return;
        
        (async () => {
            const data = await fetch(`/api/getComments?post_id=${commentView.comment.post_id}&parent_id=${commentView.comment.id}&sort=Top&limit=100&page=0&max_depth=1
            `);
            const json = (await data.json());
            if(json.error) {
                console.error(json.error)
                setChildrenError(true);
                return;
            } else {
                setChildrenError(false);
                const comments = json as GetCommentsResponse;
                setChildren(comments.comments.filter(c => c.comment.id !== commentView.comment.id));
            }

        })()
    }, [commentView, allComments, childrenError])

    return (
        <>
        <div className={`${styles.wrapper}`}>

            <div className={`${styles.header}`}>
                <div className={`${styles.username}`}><Username user={commentView?.creator} baseUrl="" /></div>
                <span className={`${styles.date}`}>On {new Date(commentView?.comment?.published).toDateString()}</span>
            </div>

            <div className={`${styles.body}`}>
                <div className={`${styles.chainlineWrapper} `} onClick={() => setChildrenHidden(!childrenHidden)} >
                    <div className={`${styles.chainlineLine} ${colors[depth]}`}></div>
                </div>
                <div className={`${styles.content}`}>

                    <div className={`${styles.comment}`}>
                        <div className={`${styles.commentText}`}>
                            <RenderMarkdown>{commentView?.comment?.content}</RenderMarkdown>
                        </div>
                        <div className={`${styles.commentInteractions}`}>
                            <div className={`${styles.commentVotes}`}>
                                <span className={`material-icons ${styles.upvote}`}>arrow_upward</span>
                                <span className={`${styles.votesCount}`}>{commentView?.counts.score}</span>
                                <span className={`material-icons ${styles.downvote}`}>arrow_downward</span>
                            </div>
                            <div className={`${styles.commentReply}`}><span className="material-icons">chat_bubble_outline</span>Reply</div>
                            <div className={`${styles.commentShare}`}><span className="material-icons">share</span></div>
                            <div className={`${styles.commentMore}`}><span className="material-icons">more_vert</span></div>
                        </div>
                    </div>

                    {!childrenHidden && 
                        <div>
                            {children?.map((comment, index) => (
                                <Comment commentView={comment} allComments={allComments} key={index} depth={depth+1} />
                            ))}
                        </div>
                    }

                </div>
                
            </div>
            
            
        </div>
        </>
    )
}