"use client";

import { usePathname } from "next/navigation"; 
import { useEffect, useState } from "react";
import { GetPersonDetailsResponse, GetSiteResponse, PostView } from "lemmy-js-client";
import { useNavbar } from "@/hooks/navbar";
import InfiniteScroll from "react-infinite-scroller";
import Loader from "@/components/ui/Loader";
import Post from "@/components/Post";
import Button from "@/components/ui/Button";
import { deleteCookie } from "cookies-next";
import { useSession } from "@/hooks/auth";
import { useRouter } from "next/navigation";
import RenderMarkdown from "@/components/ui/RenderMarkdown";
import { NumericFormat } from "react-number-format";

import postListStyles from "@/styles/postList.module.css"
import styles from "@/styles/Pages/UserPage.module.css";

export default function User() {
    const { navbar, setNavbar } = useNavbar();
    const { session, setSession } = useSession();

    const [userData, setUserData] = useState<GetPersonDetailsResponse>({} as GetPersonDetailsResponse);
    const [userDataError, setUserDataError] = useState(true);

    // posts stuff
    const [posts, setPosts] = useState<PostView[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageLimit, setPageLimit] = useState<number>(10);
    const [morePages, setMorePages] = useState<boolean>(true);

    const router = useRouter();

    // community id
    const pathname = usePathname().split("/")[2];

    useEffect(() => {
        setNavbar({ ...navbar!, showFilter: false, showSort: false, showSearch: true, showUser: true, showback: true })
    }, [])
    
    useEffect(() => {
        if(!userDataError) return;
        (async () => {
            const data = await fetch(`/api/getUser?username=${pathname}`);
            const json = (await data.json());
            if(json.error) { 
                console.error(json.error)
                setUserDataError(true);
            } else {
                setUserDataError(false);  
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

    let post_score= userData?.person_view?.counts?.post_score;
    let comment_score = userData?.person_view?.counts?.comment_score;
    let post_count = userData?.person_view?.counts?.post_count;
    let comment_count = userData?.person_view?.counts?.comment_count;
    
    let comment_amount = userData?.comments?.length;
    let post_amount = userData?.posts?.length;

    let karma = Math.ceil(((post_score*0.9 + comment_score*0.5) + (comment_amount*0.5 + post_amount*0.9)) / (post_count*0.75 + comment_count*0.25)*20)

    return (
    <>
        <div className={`${styles.bannerOverlay} `}></div>
        <img src={userData?.person_view?.person?.banner} alt="" className={`${styles.banner}`} />
        <div className="flex min-h-screen flex-col items-center overflow-x-hidden mt-20">
            <div className={`${styles.userDetailsWrapper} `}>
                    
                <div className={`${styles.userDetails}`}>
                    <div className={`${styles.userAvatar}`}>
                        <img src={userData?.person_view?.person?.avatar} alt=""  />
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-0">
                            <h1 className=" text-3xl font-bold">{userData?.person_view?.person?.display_name}</h1>
                            <div className="flex flex-row gap-4 items-center max-sm:text-xs">
                                <span className="font-light flex items-center justify-center">@{userData?.person_view?.person?.name}</span>
                                <span className="dividerDot"></span>
                                <span className="flex items-center justify-center gap-1 text-neutral-300">
                                    <span className="material-icons" style={{ fontSize: "1rem" }}>cake</span>
                                    <span className="flex items-center justify-center">{new Date(userData?.person_view?.person?.published).toDateString()}</span>
                                </span>
                            </div>
                        </div>
                        
                        <span><RenderMarkdown>{userData?.person_view?.person?.bio}</RenderMarkdown></span>

                        <div className="flex flex-row gap-2 items-center">
                            <button className={`${styles.button} ${styles.buttonFuchsia}`}><span className="material-icons-outlined">chat_bubble_outline</span>Message</button>
                            <button className={`${styles.button} ${styles.buttonBlock}`}><span className="material-icons">block</span>Block user</button>
                        </div>

                        <div className={"flex flex-row flex-wrap gap-4"}>
                            <div className={`snack`}>
                                <span className="material-icons">auto_awesome</span>
                                <NumericFormat displayType="text" className="flex bg-transparent w-full appearance-none " value={karma} thousandSeparator />
                                <span>Points</span>
                                    
                            </div>
                        </div>
                        
                        
                    </div>
                    
                </div>

                
            </div>
            
            
            <div className="flex flex-col items-center w-full bg-neutral-50 dark:bg-neutral-950 dark:pt-4 gap-4">

                <div className={`${styles.sortsWrapper}`}>

                    <div className="flex flex-row gap-4 items-center">

                        <div className={`${styles.sort}`}>
                            <div className="flex flex-row items-center gap-2">
                                <span className="material-icons-outlined">whatshot</span>
                                <span>Hot</span>
                            </div>
                            
                            <span className="material-icons">expand_more</span>
                        </div>

                        <div className={`${styles.sort}`}>
                            <div className="flex flex-row items-center gap-2">
                                <span className="material-icons-outlined">auto_awesome_motion</span>
                                <span>Posts</span>
                            </div>
                            
                            <span className="material-icons">expand_more</span>
                        </div>

                    </div>
                    


                    <div className="flex items-center">
                        <span className="material-icons-outlined">view_day</span>
                    </div>
                </div>

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
    </>
    )
}