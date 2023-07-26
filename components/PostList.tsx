"use client"

import { useState, useEffect } from "react";
import { CommunityId, ListingType, PostView, SortType} from "lemmy-js-client";
import InfiniteScroll from "react-infinite-scroller";
import { motion } from "framer-motion";

import { useSession } from "@/hooks/auth";
import { useNavbar } from "@/hooks/navbar";
import { usePost } from "@/hooks/post";

import EndlessScrollingEnd from "./ui/EndlessSrollingEnd";
import Loader from "./ui/Loader";

import { DEFAULT_POST_LIMIT } from "@/constants/settings";

import Post from "./Post";

import styles from "../styles/postList.module.css"


/**
 * PostList
 */
export default function PostList({ fetchParams={ limit: DEFAULT_POST_LIMIT, page: 1 }, initPosts, setCurrentPost=() => null } : { 
    fetchParams?: 
        {
            type_?: ListingType, sort?: SortType,
            page?: number, limit?: number,
            community_id?: CommunityId, community_name?: string,
            saved_only?: boolean, auth?: string
        },
    initPosts?: PostView[],
    setCurrentPost?: Function,
    }) {
    const { session } = useSession();
    const { navbar, setNavbar } = useNavbar();
    const { post, setPost } = usePost();

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
        if(fetchParams.sort && fetchParams.sort !== currentSort) {
            setPosts([]);
            setCurrentPage(1);
        } 
        else if (navbar?.currentSort && navbar.currentSort !== currentSort) {
            setCurrentSort(navbar.currentSort);
            setPosts([]);
            setCurrentPage(1);
        }
    }, [navbar?.currentSort, fetchParams?.sort])
    
    useEffect(() => {
        if (navbar?.currentType && navbar.currentType !== currentType) {
            setCurrentType(navbar.currentType);
            setPosts([]);
            setCurrentPage(1);
        }
    }, [navbar?.currentType])

    const getPosts = async ({ page=1 } : { page?: number }) => {
        const data = await fetch(`/api/getPosts?page=${page}&community_name=${fetchParams.community_name}&auth=${session?.currentAccount?.jwt}&sort=${currentSort}&type_=${currentType}&instance=${session.currentAccount?.instance}`);
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
        <motion.div
            id="postList"
            initial={{ opacity: 0, x: -1000 }}
            animate={{ opacity: 1, x: 0, transition: { bounce: 0.1} }}
            exit={{ opacity: 0, x: -1000 }}
            className="flex flex-col items-center w-full">
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
                        return <Post onClick={() => setPost(post)}  post={post} key={index} />
                    })}
                    
                    {!morePages && posts.length > 0 && <EndlessScrollingEnd key={"end"} />}
                    
                </InfiniteScroll>
            </div>
        </motion.div>
    )
}