"use client"
import Link from "next/link"
import { ClipLoader } from "react-spinners"
import { CommunityView, PostView, SearchResponse } from "lemmy-js-client"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { disablePageScroll, enablePageScroll } from "scroll-lock"

import Username from "../User/Username"
import RenderMarkdown from "../ui/RenderMarkdown"

import styles from "@/styles/components/Navbar/SearchOverlay.module.css"
import { DEFAULT_AVATAR } from "@/constants/settings"
import { FormatNumber } from "@/utils/helpers"


function TrendingCommunity({ community, closeSearch } : { community: CommunityView, closeSearch: Function }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { bounce: 0.2 } }}
            exit={{ opacity: 0, y: 10 }}        
        >
            <Link href={`/c/${community?.community?.name}@${new URL(community?.community?.actor_id).host}`} onClick={() => closeSearch()} className=" bg-neutral-50 dark:bg-neutral-900 p-4 flex flex-row justify-start items-center gap-2 rounded-xl border border-neutral-500 dark:border-neutral-800">
                <Image width={48} height={48} className="h-12 w-12 rounded-full object-cover" src={community.community.icon || DEFAULT_AVATAR} alt="" />
                <div className="flex flex-col gap-1">
                    <span className="font-bold max-sm:text-xs">c/{community.community.name}</span>
                    <div className="flex flex-row items-center text-neutral-400 text-xs">
                        <div className="flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>communities</span>{community?.counts?.subscribers}</div>
                        <div className="dividerDot"></div>
                        <div className="flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>group</span>{community?.counts?.users_active_day} / Day</div>
                        <div className="dividerDot"></div>
                        <div className="flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>edit</span>{FormatNumber(community?.counts?.posts, true)}</div>
                    </div>
                </div>
            </Link>
        </motion.div>
)
}

function TrendingTopic({ post, closeSearch } : { post: PostView, closeSearch: Function }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { bounce: 0.2 } }}
            exit={{ opacity: 0, y: 10 }}
        >
            <Link href={`/post/${post?.post?.id}?instance=${new URL(post?.post?.ap_id).host}&preload=true`} onClick={() => {localStorage.setItem("currentPost", JSON.stringify(post)) ; closeSearch()}} className=" bg-neutral-50 dark:bg-neutral-900 p-4 flex flex-row justify-between rounded-xl border border-neutral-500 dark:border-neutral-800">
                <div className="flex flex-row gap-2 w-9/12">
                    <span className="material-symbols-outlined text-fuchsia-500" style={{ fontSize: "1.75rem" }}>trending_up</span>
                    <div className="flex flex-col gap-2">

                        <div className="flex flex-col gap-1">
                            <span className="font-bold max-sm:text-xs">{post?.post?.name}</span>
                            <span className="text-xs text-neutral-500 dark:text-neutral-300">c/{post?.community?.name}</span>
                        </div>

                        <div className="flex flex-row items-center text-neutral-400 text-xs">

                            <div className="flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>readiness_score</span>
                                <span className="h-full flex items-center justify-center">{post?.counts?.score}</span>
                            </div> 

                            <div className="dividerDot"></div>
                            
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>comment</span>
                                <span>{post?.counts?.comments}</span>
                            </div> 

                        </div>

                    </div>
                </div>
                <Image height={80} width={80} className="h-20 w-20 rounded-lg object-cover overflow-hidden" src={post?.post?.thumbnail_url || post?.post?.url || ""} alt="" />
            </Link>
        </motion.div>
    )
}


export default function SearchOverlay({
    handleCloseSearchOverlay, searchInputRef, handleSubmit, searchLoading, currentSearch, setCurrentSearch, isSearching, trendingTopics, trendingCommunities, searchResults
} : {
    handleCloseSearchOverlay: Function, searchInputRef: any, handleSubmit: any, searchLoading: boolean, currentSearch: string, setCurrentSearch: Function, isSearching: boolean, trendingTopics: PostView[], trendingCommunities: CommunityView[], searchResults: SearchResponse
    }) {

    useEffect(() => {
        disablePageScroll();
    }, [])

    const handleClose = () => {
        enablePageScroll();
        handleCloseSearchOverlay();
    }

    return (
        <>
        <motion.div 
            id="search" className={`${styles.searchOverlay} `}
            initial={{ opacity: 0, y: 1000 }}
            animate={{ opacity: 1, y: 0, transition: { bounce: 0 } }}
            exit={{ opacity: 0, y: 1000 }}
            >
                <div className={`${styles.searchInputWrapper}`}>
                    <button onClick={() => handleClose()} ><span className="material-symbols-outlined text-neutral-400">arrow_back</span></button>
                    <form onSubmit={handleSubmit} className="flex flex-row items-center w-full">
                        <div onClick={() => searchInputRef?.current?.focus()} className={`${styles.searchInput}`}>
                            <div className="flex flex-row gap-2 items-center w-full">
                                <span className="material-symbols-outlined text-neutral-400 select-none">search</span>
                                <input 
                                    value={currentSearch} onChange={(e) => setCurrentSearch(e.currentTarget.value)} 
                                    ref={searchInputRef}
                                    type="text" placeholder="Search" className="w-full h-full bg-transparent appearance-none outline-none font-bold" />
                            </div>
                           
                            { searchLoading ?
                            <ClipLoader color={"#e6b0fa"} size={20} />
                            :
                            <button type="button" className="flex items-center justify-center" onClick={() => setCurrentSearch("")}><span className="material-symbols-outlined filled text-neutral-400 select-none">cancel</span></button>
                            }
                        </div>
                        
                    </form>
                </div>

                {!isSearching &&
                <div className={`${styles.searchOverlayTrending} overflow-y-auto`}>

                    <div className="flex flex-col gap-2 w-full h-fit">
                        <span className="font-bold text-xs uppercase ml-5 dark:text-neutral-200">Popular topics</span>

                        {trendingTopics?.map((post, index) => (
                            <TrendingTopic key={index} post={post} closeSearch={handleCloseSearchOverlay} />
                        ))}

                    </div>
 
                    <div className="flex flex-col gap-2 h-fit">
                        <span className="font-bold text-xs uppercase ml-5 dark:text-neutral-200">Trending communities</span>

                        {trendingCommunities?.map((community, index) => (
                            <TrendingCommunity key={index} community={community} closeSearch={handleCloseSearchOverlay}  />
                        ))}

                    </div>

                </div>
                }

                { isSearching &&
                <div className="flex flex-col gap-0 w-full overflow-scroll h-full relative">
                    {searchResults.posts?.map((result, index) => (
                        <Link href={`/post/${result?.post?.id}`} target="_blank" key={index} className="flex flex-row p-4 items-center justify-between bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-700">
                            <div className="flex flex-col gap-3">

                                <div className="flex flex-row items-center gap-2 ">
                                    <Image width={48} height={48} className="h-12 w-12 rounded-full" src={result?.community?.icon || DEFAULT_AVATAR } alt="" />
                                    <div className="flex flex-col gap-1">
                                        <span>c/{result?.community?.name}</span>
                                        <div className="flex flex-row">
                                            {result.creator && <Username user={result.creator} baseUrl="" />}
                                            <div className="dividerDot"></div>
                                        </div>
                                        
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="font-bold">{result?.post?.name}</span>
                                   {!result?.post?.thumbnail_url && <span className=" text-neutral-500 dark:text-neutral-300 line-clamp-2"><RenderMarkdown>{result?.post?.body}</RenderMarkdown></span>}
                                </div>

                                <div className="flex flex-row gap-4 text-neutral-500 dark:text-neutral-300">
                                    <div className="flex flex-row gap-2 items-center ">
                                        <div className="flex items-center gap-1 ">
                                            <span className="material-symbols-outlined">thumb_up</span>
                                            <span className="">{result?.counts.upvotes}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined">thumb_down</span>
                                            <span className="">{result?.counts?.downvotes}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <span className="material-symbols-outlined">chat_bubble</span>
                                        <span className="">{result?.counts?.comments}</span>
                                    </div>
                                    
                                </div>

                            </div>
                            {result?.post?.thumbnail_url && <Image width={96} height={96} className="w-24 h-24 rounded-lg" src={result.post.thumbnail_url} alt="" /> }
                        </Link>
                    ))}
                </div>
                }

        </motion.div>
        </>
    )
}