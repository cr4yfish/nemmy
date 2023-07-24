"use client"

import { useState, useEffect } from "react";
import { CommunityId, ListingType, PostView, SortType} from "lemmy-js-client";
import InfiniteScroll from "react-infinite-scroller";

import { useSession } from "@/hooks/auth";
import { useNavbar } from "@/hooks/navbar";

import EndlessScrollingEnd from "./ui/EndlessSrollingEnd";

import { DEFAULT_POST_LIMIT } from "@/constants/settings";

import Post from "./Post";

import styles from "../styles/postList.module.css"

function Loader() {
    return (
        <div className={`${styles.loader}`} key={"loader"}>
            <div className="h-20 w-8 bg-neutral-200 dark:bg-neutral-800 rounded-lg max-md:hidden"></div>
            <div className="flex flex-col gap-4 w-full h-full">
                <div className="w-full h-4 bg-neutral-200 dark:bg-neutral-800 rounded-lg"></div>
                <div className="w-full h-6 bg-neutral-200 dark:bg-neutral-800 rounded-lg"></div>
                <div className="w-full h-12 bg-neutral-200 dark:bg-neutral-800 rounded-lg"></div>
                <div className=" w-full h-6 flex gap-4">
                    <div className="bg-neutral-200 dark:bg-neutral-800 w-12 h-full rounded-lg"></div>
                    <div className="bg-neutral-200 dark:bg-neutral-800 w-8 h-full rounded-lg"></div>
                    <div className="bg-neutral-200 dark:bg-neutral-800 w-8 h-full rounded-lg"></div>
                </div>
            </div>
        </div>
    )
}

/**
 * PostList
 */
export default function PostList({ fetchParams={ limit: DEFAULT_POST_LIMIT, page: 1 }, initPosts } : { 
    fetchParams?: 
        {
            type_?: ListingType, sort?: SortType,
            page?: number, limit?: number,
            community_id?: CommunityId, community_name?: string,
            saved_only?: boolean, auth?: string
        },
        initPosts?: PostView[]
    }) {
    const { session } = useSession();
    const { navbar, setNavbar } = useNavbar();
    const [posts, setPosts] = useState<PostView[]>(initPosts || []);
    const [currentPage, setCurrentPage] = useState<number>(fetchParams.page || 1);
    const [morePages, setMorePages] = useState<boolean>(true);
    const [currentSort, setCurrentSort] = useState<SortType>(fetchParams.sort || "Active");
    const [currentType, setCurrentType] = useState<ListingType>(fetchParams.type_ || "All");

    useEffect(() => {
        setNavbar({
            ...navbar!,
            showMenu: true, showSort: true, showFilter: true, 
            showSearch: true, showUser: true, showback: false, 
            hidden: false, titleOverride: ""
        })
    }, [])

    useEffect(() => {
        if (navbar?.currentSort && navbar.currentSort !== currentSort) {
            setCurrentSort(navbar.currentSort);
            setPosts([]);
            setCurrentPage(1);
        }
    }, [navbar?.currentSort])
    
    useEffect(() => {
        if (navbar?.currentType && navbar.currentType !== currentType) {
            setCurrentType(navbar.currentType);
            setPosts([]);
            setCurrentPage(1);
        }
    }, [navbar?.currentType])

    const getPosts = async ({ page=1 } : { page?: number }) => {
        const data = await fetch(`/api/getPosts?page=${page}&community_name=${fetchParams.community_name}&auth=${session?.currentAccount?.jwt}&sort=${currentSort}&type_=${currentType}`);
        const json = (await data.json()).posts;
        if(json?.length === 0) {
            setMorePages(false);
        }
        return json as PostView[];
    }

    const handleLoadMore = async () => {
        const data = await getPosts({ page: currentPage });
        if(!data) return;

        // Filter out duplicates
        // Duplicates can happen when a posts changes ranking between page loads
        const uniquePosts = data.filter((post) => {
            return !posts.some((post2) => post.post.id === post2.post.id)
        })

        // Filter out deleted and removed posts
        const filteredPosts = uniquePosts.filter((post) => {
            return post.post.removed === false && post.post.deleted === false
        })

        setPosts(prevState => {
            return [...prevState, ...filteredPosts];
        });
        setCurrentPage(currentPage + 1);
    }

    return (
        <div className="flex flex-col items-center w-full">
            <div className="flex flex-col items-center justify-start pb-10 max-w-3xl max-md:w-full">
                
                <InfiniteScroll 
                    pageStart={1}
                    loadMore={async () => await handleLoadMore()}
                    hasMore={morePages}
                    loader={<Loader key={"loaderCard"} />}
                    className={`${styles.postList} pb-10`}
                    key={"postList"}
                    >
                    {posts.map((post: PostView, index: number) => {
                        return <Post post={post} key={index} />
                    })}
                    
                    {!morePages && posts.length > 0 && <EndlessScrollingEnd />}
                    
                </InfiniteScroll>
            </div>
        </div>
    )
}