"use client"
import Link from "next/link"
import { ClipLoader } from "react-spinners"
import { CommunityView, PostView, SearchResponse } from "lemmy-js-client"
import Image from "next/image"

import Username from "../User/Username"
import RenderMarkdown from "../ui/RenderMarkdown"

import styles from "@/styles/components/Navbar/SearchOverlay.module.css"
import { DEFAULT_AVATAR } from "@/constants/settings"

function TrendingCommunity({ community, closeSearch } : { community: CommunityView, closeSearch: Function }) {
    return (
    <Link href={`/c/${community.community.name}`} onClick={() => closeSearch()} className=" bg-neutral-50 dark:bg-neutral-950 p-4 flex flex-row justify-start items-center gap-2 rounded-xl border border-fuchsia-500 dark:border-fuchsia-800">
        <Image width={48} height={48} className="h-12 w-12 rounded-full" src={community.community.icon || DEFAULT_AVATAR} alt="" />
        <div className="flex flex-col gap-1">
            <span className="font-bold">{community.community.name}</span>
            <div className="flex flex-row gap-2 h-fit">
                <div className="snack"><span className="material-symbols-outlined">communities</span>{community.counts.subscribers}</div>
                <div className="snack"><span className="material-symbols-outlined">group</span>{community.counts.users_active_day} / Day</div>
            </div>
        </div>
    </Link>
)
}

function TrendingTopic({ post, closeSearch } : { post: PostView, closeSearch: Function }) {
    return (
        <Link href={`/post/${post.post.id}`} onClick={() => closeSearch()} className=" bg-neutral-50 dark:bg-neutral-950 p-4 flex flex-row justify-between rounded-xl border border-fuchsia-500 dark:border-fuchsia-800">
            <div className="flex flex-row gap-1 w-9/12">
                <span className="material-symbols-outlined" style={{ fontSize: "2rem" }}>chart_data</span>
                <div className="flex flex-col">
                    <span className="font-bold">{post?.post?.name}</span>
                    <span className=" text-neutral-500 dark:text-neutral-300">c/{post?.community?.name}</span>
                </div>
            </div>
            <Image height={80} width={80} className="h-20 w-20 rounded-lg object-contain" src={post?.post?.thumbnail_url || post?.post?.url || ""} alt="" />
        </Link>
    )
}


export default function SearchOverlay({
    active, handleCloseSearchOverlay, searchInputRef, handleSubmit, searchLoading, currentSearch, setCurrentSearch, isSearching, trendingTopics, trendingCommunities, searchResults
} : {
    active: boolean, handleCloseSearchOverlay: Function, searchInputRef: any, handleSubmit: any, searchLoading: boolean, currentSearch: string, setCurrentSearch: Function, isSearching: boolean, trendingTopics: PostView[], trendingCommunities: CommunityView[], searchResults: SearchResponse
    }) {

    return (
        <>
        <div id="search" className={`${styles.searchOverlay} ${active && styles.searchActive}`}>
                <div className={`${styles.searchInputWrapper}`}>
                    <button onClick={() => handleCloseSearchOverlay()} ><span className="material-symbols-outlined text-neutral-400">arrow_back</span></button>
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
                <div className={`${styles.searchOverlayTrending}`}>

                    <div className="flex flex-col gap-2 w-full">
                        <span className="font-bold text-xl">Popular</span>

                        {trendingTopics?.map((post, index) => (
                            <TrendingTopic key={index} post={post} closeSearch={handleCloseSearchOverlay} />
                        ))}

                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="font-bold text-xl">Trending communities</span>

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

        </div>
        </>
    )
}