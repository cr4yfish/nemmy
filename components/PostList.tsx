"use client"

import { useState, useEffect } from "react";
import { CommunityId, ListingType, PostView, SortType } from "lemmy-js-client";
import InfiniteScroll from "react-infinite-scroller";

import Post from "./Post";

import styles from "../styles/postList.module.css"


function Loader() {
    return (
        <>
        <div className={styles.loader}>
            <div className="h-14 w-4 dark:bg-neutral-800 rounded-lg max-md:hidden"></div>
            <div className="flex flex-col gap-4 w-full h-full">
                <div className="w-full h-4 dark:bg-neutral-800 rounded-lg"></div>
                <div className="w-full h-6 dark:bg-neutral-800 rounded-lg"></div>
                <div className="w-full h-12 dark:bg-neutral-800 rounded-lg"></div>
            </div>
        </div>
        </>
    )
}

/**
 * PostList
 */
export default function PostList({ fetchParams={ limit: 10, page: 1 } } : { 
    fetchParams?: 
        {
            type_?: ListingType, sort?: SortType,
            page?: number, limit?: number,
            community_id?: CommunityId, community_name?: string,
            saved_only?: boolean, auth?: string
        }
    }) {
    const [posts, setPosts] = useState<PostView[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(fetchParams.page || 1);
    const [pageLimit, setPageLimit] = useState<number>(fetchParams.limit || 10);
    const [morePages, setMorePages] = useState<boolean>(true);

    const getPosts = async ({ page=1 } : { page?: number }) => {
        const data = await fetch(`/api/getPosts?limit=${pageLimit}&page=${page}&community_name=${fetchParams.community_name}`);
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
        <main className="flex flex-col items-center">
        <div className="flex flex-col items-center justify-start max-w-3xl max-md:w-full">
            
            <InfiniteScroll 
                pageStart={1}
                loadMore={async () => await handleLoadMore()}
                hasMore={morePages}
                loader={<Loader />}
                className={styles.postList}
                >
                {posts.map((post: PostView, index: number) => {
                    return <Post post={post} key={post.post.id} />
                })
                }
            </InfiniteScroll>
        </div>
        </main>
    )
}