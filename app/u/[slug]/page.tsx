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
        setNavbar({ ...navbar!, showSort: false, showSearch: true, showUser: true, showback: true })
    }, [])
    
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

    const handleLogout = async () => {
        
        // delete the cookie
        deleteCookie("jwt");

        // delete sessionStorage
        sessionStorage.removeItem("jwt");

        // set session to empty
        setSession({ user: {} as GetSiteResponse, jwt: "" });

        // redirect to home
        router.push("/");
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
                        
                        <span><RenderMarkdown>{userData?.person_view?.person?.bio}</RenderMarkdown></span>
                        <span className="flex items-center gap-2 text-neutral-300"><span className="material-icons">cake</span>{new Date(userData?.person_view?.person?.published).toDateString()}</span>
                        
                        { session?.user?.my_user?.local_user_view.person.id == userData?.person_view?.person?.id &&
                        <div className="flex flex-row justify-start items-center w-32 ">
                            <Button onClick={() => handleLogout()} variant="secondary">Log out</Button>
                        </div>
                        }
                        
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