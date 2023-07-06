"use client";

import { usePathname } from "next/navigation"; 
import { useEffect, useState } from "react";
import { GetPersonDetailsResponse, PostView } from "lemmy-js-client";

import { AutoMediaType } from "@/utils/AutoMediaType";
import Username from "@/components/User/Username";
import Comment from "@/components/Comment";
import PostList from "@/components/PostList";
import InfiniteScroll from "react-infinite-scroller";
import Loader from "@/components/ui/Loader";
import Post from "@/components/Post";

import postListStyles from "@/styles/postList.module.css"
import styles from "@/styles/Pages/UserPage.module.css";

export default function User() {
    const [userData, setUserData] = useState<GetPersonDetailsResponse>({} as GetPersonDetailsResponse);
    const [userDataError, setUserDataError] = useState(true);

    // posts stuff
    const [posts, setPosts] = useState<PostView[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageLimit, setPageLimit] = useState<number>(10);
    const [morePages, setMorePages] = useState<boolean>(true);

    // community id
    const pathname = usePathname().split("/")[2];

    useEffect(() => {
        if(!userDataError) return;
        (async () => {
            console.log("Loading User data...");
            const data = await fetch(`/api/getUser?username=${pathname}`);
            const json = (await data.json());
            if(json.error) { 
                console.error(json.error)
                setUserDataError(true);
            } else {
                console.log(json);
                setUserDataError(false);
                console.log("Retrying user fetch...");   
                setUserData(json as GetPersonDetailsResponse);
                return;
            }
        })();

    }, [pathname, userDataError]);

    const getPosts = async ({ page=1 } : { page?: number }) => {
        const data = await fetch(`/api/getUser?limit=${pageLimit}&page=${page}&username=${pathname}`);
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
        <div className="flex min-h-screen flex-col items-center mt-4">
            <div className={`${styles.userDetailsWrapper}`}>
                    
                <div className={`${styles.userDetails}`}>
                    <div className={`${styles.userAvatar}`}>
                        <img src={userData?.person_view?.person?.avatar} alt=""  />
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-0">
                            <h1 className=" text-3xl font-bold">{userData?.person_view?.person?.display_name}</h1>
                            <span className="font-light">@{userData?.person_view?.person?.name}</span>
                        </div>
                        
                        <span>{userData?.person_view?.person?.bio}</span>
                        <span className="flex items-center gap-2 text-neutral-300"><span className="material-icons">cake</span>{new Date(userData?.person_view?.person?.published).toDateString()}</span>
                    </div>
                </div>

                <img src={userData?.person_view?.person?.banner} alt="" className={`${styles.banner}`} />
            </div>
            

            
            
            <div className="flex flex-col items-center w-full">
                <div className="flex flex-col items-center justify-start max-w-3xl max-md:w-full">
                    
                    <InfiniteScroll 
                        pageStart={1}
                        loadMore={async () => await handleLoadMore()}
                        hasMore={morePages}
                        loader={<Loader />}
                        className={postListStyles.postList}
                        >
                        {posts.map((post: PostView, index: number) => {
                            return <Post post={post} key={post.post.id} />
                        })
                        }
                    </InfiniteScroll>
                </div>
            </div>
        
        </div>
    )
}