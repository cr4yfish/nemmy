"use client"
import { useState, useRef, FormEvent, useEffect } from "react"
import { ClipLoader, BounceLoader } from "react-spinners"
import { CommentResponse, CommentSortType, CommentView, GetCommentsResponse, GetPostResponse, PostView } from "lemmy-js-client"
import InfiniteScroll from "react-infinite-scroller"
import Link from "next/link"

import RenderFormattingOptions from "./ui/RenderFormattingOptions"

import { sendComment, getComments } from "@/utils/lemmy" 

import { useSession } from "@/hooks/auth"

import Comment from "./Comment"
import WriteCommentOverlay from "./WriteCommentOverlay"

import { DEFAULT_INSTANCE } from "@/constants/settings"

import styles from "@/styles/Pages/PostPage.module.css"
import EndlessScrollingEnd from "./ui/EndlessSrollingEnd"



function Loader() {
    return (
        <div className="flex justify-center items-center w-full mb-10">
            <BounceLoader color="#e6b0fa" size={20} speedMultiplier={.75} />
        </div>
    )
}

export default function Comments({
    postId, jwt, instance, setPostData, postData, commentResponse
} : { 
    postId: number, jwt?: string, instance?: string, 
    setPostData: (postData: PostView) => void, postData: PostView,
    commentResponse?: CommentResponse
}) {
    const { session } = useSession();

    const [commentsData, setCommentsData] = useState<GetCommentsResponse>({} as GetCommentsResponse);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [replyLoading, setReplyLoading] = useState<boolean>(false);
    const [replyComment, setReplyCommet] = useState<CommentView>({} as CommentView);
    const [replyCommentText, setReplyCommentText] = useState<string>("");

    const [showReply, setShowReply] = useState<boolean>(false);

    const [currentCommentsPage, setCurrentCommentsPage] = useState<number>(1);
    const [currentCommentSort, setCurrentCommentSort] = useState<CommentSortType | undefined>("Hot");
    const [forceCommentUpdate, setForceCommentUpdate] = useState<number>(0);
    const [commentsLoading, setCommentsLoading] = useState<boolean>(true);
    const [hasMoreComments, setHasMoreComments] = useState<boolean>(true);

    // commentReplyMode
    const [parentId, setParentId] = useState<number | undefined>(undefined);

    // Adjust textarea height to content on user input
    useEffect(() => {
        const textarea = textareaRef.current;

        function adjustHeight() {
            if(!textarea) return;
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        }

        textarea?.addEventListener("input", adjustHeight);
        adjustHeight();

        // Cleanup on onmount
        return () => {
            textarea?.removeEventListener("input", adjustHeight);
        }
    }, [])

    // Try to get comments from localStorage
    useEffect(() => {
        if(commentResponse) return;
        const localStorageComments = localStorage.getItem("comments");
        if(localStorageComments) {
            const parsed = JSON.parse(localStorageComments);
            if(parsed.postId == postId) {
                setCommentsData({ comments: parsed.comments });
            }
        }
    }, [])
    
    // Save comments to localStorage every 500ms when loaded new Comments
    useEffect(() => {
        if(commentResponse) return;
        const timer = setTimeout(() => {
            if(!commentsData?.comments) return;
            localStorage.setItem("comments", JSON.stringify({ postId: postData?.post?.id, comments: commentsData?.comments}));
        }, 500)
        return () => clearTimeout(timer);
    }, [commentsData])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setReplyLoading(true);

        if(!jwt || !postId || replyCommentText?.length < 1) return;

        const comment = await sendComment({
            content: replyCommentText,
            post_id: postId,
            parent_id: replyComment?.comment?.id,
            auth: jwt
        });

        if(!comment) return alert("Something went wrong");

        const oldComments = commentsData.comments;
        const newComments = [comment, ...oldComments];
        setCommentsData({ ...commentsData, comments: newComments });

        const oldPostData = postData;
        const newPostData = { ...oldPostData, post_view: { ...oldPostData, post: { ...oldPostData.post, num_comments: oldPostData.counts.comments + 1 } } }
        setPostData(newPostData);

        setReplyCommentText("");
        setShowReply(false);

        setReplyLoading(false);
    }

    useEffect(() => {
        if(commentResponse) {
            console.log("Comment response mode", commentResponse)
            setReplyCommet(commentResponse.comment_view);
            setCommentsData({ comments: [commentResponse.comment_view] });
            return;
        }
        handleLoadMoreComments();
    }, [forceCommentUpdate, instance, session.pendingAuth]);

    useEffect(() => {
        // load parent comment if reply is set
        const path = commentResponse?.comment_view?.comment?.path.split(".");
        if(path) {
            const parentId = path[path.length - 2];
            setParentId(parseInt(parentId));
        }
        
    }, [commentResponse])

    const handleLoadMoreComments = async () => {
        if(session?.pendingAuth) return;
        if(!postData?.post?.id) return;
        if(!hasMoreComments) return;
        if(commentResponse) return;

        setCommentsLoading(true);
        
        const data = await getComments({
            post_id: postData.post.id,
            sort: currentCommentSort,
            page: currentCommentsPage,
            auth: session.currentAccount?.jwt
        }, instance || DEFAULT_INSTANCE);
        if(data) { 
            setCommentsLoading(false)

            if(data.comments.length == 0) return setHasMoreComments(false);

            // Has old data
            if(commentsData?.comments?.length > 0) {
                const oldData = commentsData;
                const newData = data;

                // filter out duplicates
                const uniqueComments = newData.comments.filter((newComment) => {
                    return !oldData.comments.some((oldComment) => {
                        return oldComment.comment.id === newComment.comment.id;
                    })
                })

                // filter out removed comments and only get top-level comments
                const filtered = uniqueComments.filter((c) => !c.comment.removed && !c.comment.deleted && c.comment.path.split(".")[1] == c.comment.id.toString());

                setCommentsData({ ...oldData, comments: [...oldData.comments, ...filtered] });
            } 
            // No old data => just set new data
            else {
                setCommentsData(data);
            }
            setCurrentCommentsPage(currentCommentsPage + 1);
        }
    }

    return (
        <>
        <div id="comments" className={`flex flex-col items-center w-full gap-2`}>

            {/* desktop comments textarea */}
            <form onSubmit={(e) => handleSubmit(e)} className={`${styles.textarea} max-w-3xl max-md:w-full max-sm:p-2`}>
                <div className="flex flex-row gap-2 dark:text-neutral-400 border-b dark:border-neutral-700 pb-2 mb-1 w-full">
                    <RenderFormattingOptions />
                </div>
                <textarea 
                    disabled={replyLoading}
                    placeholder={"What are your toughts?..."} 
                    required maxLength={50000}
                    ref={textareaRef}
                    value={replyCommentText}
                    onChange={() => setReplyCommentText(textareaRef.current?.value || "")}
                />
                {
                replyLoading ?
                <ClipLoader color="#487be0" loading={true} size={25} />
                :
                <button type="submit" className="flex items-center gap-2 text-blue-500 m-3">
                    Post Comment
                    <span className="material-symbols-outlined">send</span>
                </button>
                }
            </form>
            
            {/* mobile comments button => opens WriteCommentOverlay */}
            <button onClick={() => setShowReply(true)} className={` invisible max-md:visible fixed bottom-0 w-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 dark:border-t border-neutral-700 shadow-lg p-4 px-2 `} style={{  zIndex: "40" }} >
                <div className={` flex items-center justify-start p-4 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-lg text-xs w-full`}>
                    <span>What are your thoughts?</span>
                </div>
            </button>

            <WriteCommentOverlay 
                post={postData} comment={replyComment} show={showReply} setShow={setShowReply}
                allComments={commentsData} setPost={setPostData} setComments={setCommentsData}
            />

            <div className={`${styles.comments} max-w-3xl max-md:w-full max-sm:p-2 mb-24`}>

                {commentsData?.comments?.length > 0 && 
                <div className={`${styles.commentsInteractions}`}>
                    <div className={`${styles.commentsInteractionsSort}`}>
                        <span className={`material-icons`}>sort</span>
                        <span>Hot</span>
                    </div>
                </div>
                }

                {/* Comments  */}
                { commentResponse 
                ?
                    <div className={`${styles.commentsList}`}>
                        <Link href={`/post/${postData?.post?.id}/comment/${parentId}`} shallow className="a">
                            <button className="flex items-center gap-1">
                                <span className="material-symbols-outlined">read_more</span>
                                <span>Load Context</span>
                            </button>
                        </Link>
                        {commentsData?.comments?.map((comment, index) => (
                            <Comment
                                commentView={comment} allComments={commentsData.comments}
                                key={index} commentReplyMode
                                setReplyComment={setReplyCommet} setShowReply={setShowReply}
                            />
                        ))}
                    </div>
                :
                    <>
                    <InfiniteScroll 
                        className={`${styles.commentsList}`}
                        pageStart={1}
                        hasMore={hasMoreComments}
                        loadMore={async () => await handleLoadMoreComments()}
                        loader={<Loader key="loader" />}
                        >
                        {commentsData?.comments?.filter((c) => c.comment.path.split(".")[1] == c.comment.id.toString()).map((comment, index) => (
                            <Comment 
                                commentView={comment} allComments={commentsData.comments}
                                key={index} 
                                setReplyComment={setReplyCommet} setShowReply={setShowReply}
                                />
                        ))}
                        {!hasMoreComments && commentsData?.comments?.length > 0 && <EndlessScrollingEnd key={"end"} />}
                    </InfiniteScroll>
                    </>
                }


                { commentsData?.comments?.length == 0 && !commentsLoading &&
                <div className="flex justify-center items-center w-full mb-10">
                    <button onClick={() => setForceCommentUpdate(forceCommentUpdate + 1)}><span className="material-icons">refresh</span></button>
                </div>
                }


            </div>
        </div>
        </>
    )

}