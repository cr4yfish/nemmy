"use client";

import { useState } from "react";
import { CommentId, PostId } from "lemmy-js-client";

import { saveComment, savePost } from "@/utils/lemmy";

export default function BookmarkButton({
    onChange=() => null, initState=false, type="post",
    id, auth, instance
    } : { 
        onChange?: (newState: boolean) => void, initState?: boolean, type: "post" | "comment",
        id: number, auth: string, instance: string
    }) {

    const [bookmarked, setBookmarked] = useState<boolean>(initState);

    const handleBookmark = async () => {
        if(type === "post") {
            await savePost({
                post_id: id as unknown as PostId,
                save: !bookmarked,
                auth: auth
            }, instance);
        } else {
            await saveComment({
                comment_id: id as unknown as CommentId,
                save: !bookmarked,
                auth: auth 
            }, instance);
        }    
        setBookmarked(!bookmarked);
        onChange(!bookmarked);
    }
    return (
        <>
        <button onClick={() => handleBookmark()} className="flex justify-center items-center">
            {bookmarked ? 
            <span className="material-symbols-outlined filled">bookmark</span>
            :<span className="material-symbols-outlined">bookmark_add</span>}
        </button>
        </>
    )

}