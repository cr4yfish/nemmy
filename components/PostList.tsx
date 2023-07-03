"use client"

import { useState, useEffect } from "react";
import { PostView } from "lemmy-js-client";
import InfiniteScroll from "react-infinite-scroller";

import Post from "./Post";

import styles from "../styles/postList.module.css"


/**
 * PostList
 */
export default function PostList() {
    const [posts, setPosts] = useState<PostView[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageLimit, setPageLimit] = useState<number>(10);
    const [morePages, setMorePages] = useState<boolean>(true);

    const getPosts = async ({ page=1, limit=10 } : { page?: number; limit?: number }) => {
        const data = await fetch(`/api/getPosts?limit=${limit}&page=${page}`);
        const json = (await data.json()).posts;
        if(json.length === 0) {
            setMorePages(false);
        }

        return json as PostView[];
    }

    const handleLoadMore = async () => {
        const data = await getPosts({ page: currentPage });
        setPosts([...posts, ...data]);
        setCurrentPage(currentPage + 1);
    }

    return (
        <>
        <div className="flex flex-col items-center justify-start w-full">
            <InfiniteScroll 
                pageStart={1}
                loadMore={async () => await handleLoadMore()}
                hasMore={morePages}
                loader={<div className={styles.loader}>Loading....</div>}
                className={styles.postList}
                >
                {posts.map((post: PostView, index: number) => {
                    return <Post post={post} key={post.post.id} />
                })
                }
            </InfiniteScroll>
        </div>
        </>
    )
}