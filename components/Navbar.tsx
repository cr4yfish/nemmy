/* eslint-disable @next/next/no-img-element */
"use client"
import { FormEvent, useEffect, useState, useRef } from "react";
import { CommunityView, ListingType, PostView, Search, SearchResponse, SortType } from "lemmy-js-client";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { ClipLoader } from "react-spinners";
import { DEFAULT_INSTANCE, DEFAULT_AVATAR} from "@/constants/settings";

import { useSession } from "@/hooks/auth";
import { useNavbar, NavbarState } from "@/hooks/navbar";

import { handleLogout } from "@/utils/authFunctions";
import { getTrendingCommunities, getTrendingTopics, getUnreadCount } from "@/utils/lemmy";

import Username from "@/components/User/Username";
import RenderMarkdown from "@/components//ui/RenderMarkdown";
import Input from "@/components/ui/Input";

import styles from "@/styles/Navbar.module.css";
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

function SortButton({option, label, navbar, setNavbar, icon=undefined, replaceIcon=undefined, setSortOptions, sortOptions } : { option: SortType, label: string, navbar?: NavbarState, setNavbar?: any, icon?: string, replaceIcon?: React.ReactNode, setSortOptions: Function, sortOptions: boolean }) {
    if(!option || !label || !navbar || !setNavbar) {
        console.error("SortButton: option or label not provided", option, label, icon, replaceIcon )
        return null
    };

    const handleFilterOverlayClose = async () => {
        navbar && setNavbar({ ...navbar, overlayActive: false, currentSort: option })
        await delay(100);
        setSortOptions(false);
    }

    return (
        <>
            <button 
                onClick={() => { handleFilterOverlayClose()  }} 
                className={`${( sortOptions && navbar?.currentSort == option) && styles.activeFilterOption}`}>
                    {icon && <span className={`material-symbols-outlined`}>{icon}</span>}
                    {replaceIcon}
                    {label}
            </button>
        </>
    )
}

function FilterButton({ label, option, icon, navbar, setNavbar, setFilterClicked, filterClicked } : { label: string, option: ListingType, icon: string, navbar?: NavbarState, setNavbar?: any, setFilterClicked: Function, filterClicked: boolean }) {
    const { session } = useSession();
    const router = useRouter();
    
    const handleFilterOverlayClose = async () => {
        if(option == "Subscribed") {
            if(!session.user.my_user?.local_user_view.person.id) {
                navbar && setNavbar({...navbar, overlayActive: false })
                setFilterClicked(false);
                router.push("/auth");
                return;
            }
        }

        navbar && setNavbar({...navbar, overlayActive: false, currentType: option  })
        await delay(100);
        setFilterClicked(false);
    }

    return (
        <>
        <button 
            onClick={() => handleFilterOverlayClose()} 
            className={`${ filterClicked && navbar?.currentType == option && styles.activeFilterOption}`}>
                <span className="material-symbols-outlined">{icon}</span>
                {label}
        </button>
        </>
    )
}

async function search({ searchParams } : { searchParams: Search }) {

    // add a signature to the object to make typescript happy
    const params: { [index: string]: any } = {
        ...searchParams
    }
    
    // filter out undefined values
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key])

    const query = Object.keys(params).map((key) => key + '=' + params[key]).join('&')
    const requestUrl = `/api/search?${query}`

    const response = await fetch(requestUrl)

    const data = await response.json();
    return data;
}

function TrendingCommunity({ community, closeSearch } : { community: CommunityView, closeSearch: Function }) {
    return (
    <Link href={`/c/${community.community.name}`} onClick={() => closeSearch()} className=" bg-neutral-50 dark:bg-neutral-950 p-4 flex flex-row justify-start items-center gap-2 rounded-xl border border-fuchsia-500 dark:border-fuchsia-800">
        <img className="h-12 w-12 rounded-full" src={community.community.icon} alt="" />
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
            <img className="h-20 w-20 rounded-lg object-contain" src={post?.post?.thumbnail_url || post?.post?.url} alt="" />
        </Link>
    )
}


export default function Navbar() {
    const { session, setSession } = useSession();
    const { navbar, setNavbar } = useNavbar();
    const [isSearching, setIsSearching] = useState(false);
    const [filterClicked, setFilterClicked] = useState(false);
    const [sortOptions, setSortOptions] = useState(false);
    const [userMenu, setUserMenu] = useState(false);


    const [menu, setMenu] = useState(false);
    const [communitySearch, setCommunitySearch] = useState<string>("");

    const [searchOverlay, setSearchOverlay] = useState(false);
    const [currentSearch, setCurrentSearch] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResponse>({} as SearchResponse);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [trendingCommunities, setTrendingCommunities] = useState<CommunityView[]>([]);
    const [trendingTopics, setTrendingTopics] = useState<PostView[]>([]);

    const [unreadCount, setUnreadCount] = useState(0);

    const router = useRouter();

    // Update input value when user stops typing
    useEffect(() => {
        if(currentSearch?.length == 0) return;
        const timer = setTimeout(async () => {
            if(currentSearch.length == 0) return;
            if(currentSearch.length < 2) return alert("Search term must be at least 2 characters long");
            setSearchLoading(true)
            const data = await search({ searchParams: {
                q: currentSearch
            }})
            setIsSearching(true);
            setSearchResults(data);
            setSearchLoading(false)
        }, 1000);

        return () => clearTimeout(timer);
        
    }, [currentSearch])

    useEffect(() => {
        if(!searchOverlay) return;
        getTrendingCommunities().then((data) => {
            if(typeof data === "boolean") return;
            setTrendingCommunities(data.communities);
        })
        getTrendingTopics().then((data) => {
            if(typeof data === "boolean") return;
            setTrendingTopics(data.posts);
        })
    }, [searchOverlay])

    useEffect(() => {
        if(session.pendingAuth) return;
        getUnreadCount({ auth: session.jwt }, session.defaultInstance).then((data) => {
            if(!data) return;
            const total = data.replies + data.mentions;
            setUnreadCount(total);
        })
    }, [session.pendingAuth])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        setSearchLoading(true)
        const resp = await search({ searchParams: { 
            q: currentSearch, community_id: undefined, 
            community_name: undefined, creator_id: undefined, type_: "Posts", sort: undefined, 
            listing_type: undefined, page: undefined, limit: undefined, auth: session?.jwt || undefined 
        }})
        setSearchLoading(false)
        setSearchResults(resp);
    }

    const handleFilterOverlayClose = async () => {
        navbar && setNavbar({...navbar, overlayActive: false})
        await delay(100);
        setFilterClicked(false);
        setSortOptions(false);
    }

    const handleUserMenuClose = async () => {
    
        document.getElementById("usermenu")?.style.setProperty("display", "none");
        navbar && setNavbar({...navbar, overlayActive: false})

        await delay(100);
        
        setUserMenu(false);
    }

    const handleUserMenuOpen = async() => {
        handleFilterOverlayClose();
        document.getElementById("usermenu")?.style.setProperty("display", "flex");
        setUserMenu(true);
    }

    const handleMenuOpen = async() => {
        handleFilterOverlayClose();
        document.getElementById("menu")?.style.setProperty("display", "flex");
        setMenu(true);
    }

    const handleMenuClose = async() => {
        document.getElementById("menu")?.style.setProperty("display", "none");
        navbar && setNavbar({...navbar, overlayActive: false})
        
        await delay(100);

        setMenu(false);
    }

    const handleCloseSearchOverlay = async () => {
        setCurrentSearch("");
        setIsSearching(false);
        setSearchOverlay(false);
    }

    if(navbar?.hidden) return null;

    return (
        <>
        <nav className={`${styles.wrapper} ${navbar?.hidden && "hidden"}`}>    

            <div className="flex flex-row items-center gap-6">
                <a href="/" className={styles.logo}>Nemmy</a>

                <div className="flex flex-row gap-4 items-center">

                    { navbar?.showMenu &&  
                    <button onClick={() => handleMenuOpen()} className={`${styles.menuButton}`}>
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    }

                    { navbar?.showback &&
                    <div className={`${styles.backButton}`}>
                        <button className="flex items-center gap-2" onClick={() => router.back()}><span className="material-symbols-outlined">arrow_back</span>Back</button>
                    </div>
                    }

                    { (navbar?.titleOverride && (navbar?.titleOverride?.length > 0)) &&
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined">{navbar?.icon}</span>
                        <span className="font-bold">{navbar?.titleOverride}</span>
                    </div>
                    }
                    
                    { navbar?.showFilter &&
                    <button className={`${styles.navButton}`} onClick={() =>{ setFilterClicked(!filterClicked); setSortOptions(false); handleUserMenuClose(); setNavbar({...navbar, overlayActive: !filterClicked})  }}>
                        <div>
                            <span className="material-symbols-outlined">filter_list</span>
                            <span className={`${styles.navButtonText}`}>{navbar?.currentType}</span>
                        </div>
                        <span className="material-symbols-outlined">arrow_drop_down</span> 
                    </button> 
                    }

                    { navbar?.showSort &&
                    <button className={`${styles.navButton}`} onClick={() =>{ setSortOptions(!sortOptions); handleUserMenuClose(); handleMenuClose(); setFilterClicked(false); setNavbar({...navbar, overlayActive: !sortOptions})  }} >
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined">sort</span>
                            <span className={`${styles.navButtonText}`}>{navbar?.currentSort}</span>
                        </div>
                        <span className="material-symbols-outlined">arrow_drop_down</span> 
                    </button>
                    }
                </div>

            </div>

            <div className="flex flex-row items-center gap-4">

                { navbar?.showSearch &&
                    <button className="flex justify-center items-center" onClick={() => { setSearchOverlay(true); searchInputRef?.current?.focus()  }}><span className="material-symbols-outlined">search</span></button>
                }

                
                { navbar?.showUser &&
                <>
                 {session.jwt.length > 0 ? 
                    <button onClick={() => { handleFilterOverlayClose(); handleUserMenuOpen(); setNavbar({ ...navbar, overlayActive: true }) }}  className={`${styles.userWrapper} cursor-pointer select-none`}>
                        <div className={styles.userImage}><img src={session.user.my_user?.local_user_view.person?.avatar || DEFAULT_AVATAR } alt={"Account"} /></div>
                    </button>
                :
                    <Link href="/auth">
                        <button className={`${styles.userWrapper} cursor-pointer select-none`}>
                            Login
                        </button>
                    </Link>
                    
                }
                </>
                }

            </div>
            
        </nav>

        {/* Search Overlay */}
        <div id="search" className={`${styles.searchOverlay} ${searchOverlay && styles.searchActive}`}>
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
                                    <img className="h-12 w-12 rounded-full" src={result?.community?.icon} alt="" />
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
                            {result?.post?.thumbnail_url && <img className="w-24 h-24 rounded-lg" src={result.post.thumbnail_url} alt="" /> }
                        </Link>
                    ))}
                </div>
                }

        </div>

        {/* Mobile Menu Left Side */}
        { 
        <div id="menu" className={`${styles.menu} ${menu && styles.menuActive} overflow-y-auto`}>
            <div className={`flex flex-col h-fit gap-6 relative `}>
                <button className={`${styles.currentInstance}`} onClick={() => alert("Soon you'll be able to see Instance Details here.")} >
                    <div className="flex flex-col">
                        <span className=" uppercase font-bold text-xs dark:text-fuchsia-300">Current Instance</span>
                        <span className="font-bold ">{DEFAULT_INSTANCE}</span>
                    </div>
                    
                    <span className="material-symbols-outlined">expand_content</span>
                </button>

                <div className={`${styles.menuLinks}`}>
                    <Link onClick={() => handleMenuClose()} href={"/"}><button><span className="material-symbols-outlined">home</span>Home</button></Link>
                </div>

            </div>
            <div className={`flex flex-col gap-2`}>
                <div className="flex items-center gap-1 justify-between">
                    <span className="font-bold">Communities</span>
                    <span className="material-symbols-outlined">arrow_drop_down</span>
                </div>
               

                <div className="flex">
                    <Input 
                    onChange={(e) => setCommunitySearch(e.currentTarget.value)}
                    type="text" label="" name="searchCommunities" placeholder="Search Communities"
                    
                    />
                </div>

                <div className={`flex flex-col gap-4 overflow-y-auto relative`}>
                    {session?.user?.my_user?.follows?.filter((c) => c.community.name.includes(communitySearch)).map((community, index) => (
                        <div key={index}>
                            <Link href={"/c/Nemmy"} onClick={() => handleMenuClose()} className={`${styles.menuCommunity}`}>
                                <img className="w-10 h-10 overflow-hidden rounded-full" src={community?.community?.icon || "https://i.imgur.com/OzAB6Y0.png"} alt="" />
                                <span className=" capitalize ">{community.community.name}</span>
                            </Link>                 
                        </div>
                    ))}
                </div>
            </div>
        </div>
        }

        {/* User Menu Right Side */}
        { 
        <div id="usermenu" className={`${styles.userMenu} ${userMenu && styles.userMenuActive}`}>
            <div className={`${styles.userMenuTop}`}>

                <div className={`${styles.userProfiles}`}>

                    <div className={`${styles.userProfile}`}>
                        <img className={`${styles.userProfileBanner}`} src={session!.user.my_user?.local_user_view.person.banner} alt="" />
                        <div className={`${styles.userProfileBannerOverlay}`}></div>
                        <img className={`${styles.userProfileAvatar}`} src={session!.user.my_user?.local_user_view.person.avatar} alt="" />
                        <div className={`${styles.userProfileText}`}>
                            <span className={`${styles.userProfileUsername}`}>u/{session!.user.my_user?.local_user_view.person.name}</span>
                            <span className={`${styles.userProfileDisplayName}`}>{session!.user.my_user?.local_user_view.person.display_name}</span>
                        </div>
                    </div>

                    <div className="flex justify-center items-center w-12 h-52 px-6">
                        <button onClick={() => alert("Multiple Accounts are work in progress :)")}><span className="material-symbols-outlined">add</span></button>
                    </div>
                </div>

                <div className={`${styles.userMenuInteractionsTop}`}>
                    <Link onClick={() => handleUserMenuClose()} href={"/inbox"}>
                        <button className="relative">
                            <div className="relative h-full flex items-center justify-center w-fit">
                                {unreadCount > 0 && 
                                    <span 
                                        className=" m-2 absolute left-1/3 top-0
                                        bg-red-400 text-red-950 rounded-full px-1 text-xs font-bold
                                        ">
                                        {unreadCount}
                                    </span>
                                }
                                <span className="material-symbols-outlined">notifications</span>
                            </div>
                            Notifications
                        </button>
                    </Link>
                    <Link onClick={() => handleUserMenuClose()} href={`/u/${session?.user.my_user?.local_user_view?.person?.name}`}><button><span className="material-symbols-outlined">account_circle</span>My Profile</button></Link>
                    <Link onClick={() => handleUserMenuClose()} href="/post/new"><button><span className="material-symbols-outlined">add_circle_outline</span>Create a Post</button></Link>
                    <button className="text-neutral-400 dark:text-neutral-500 cursor-not-allowed"><span className="material-symbols-outlined">group_add</span>Create a Community</button>
                    <button className="text-neutral-400 dark:text-neutral-500 cursor-not-allowed"><span className="material-symbols-outlined">bookmarks</span>Bookmarked</button>
                    <Link onClick={() => handleCloseSearchOverlay()} href={"/chat"}><button><span className="material-symbols-outlined">chat</span>Chat</button></Link>
                </div>


            </div>

            <div className={`${styles.userMenuInteractionsBottom}`}>
                <button onClick={() => handleUserMenuClose()}><span className="material-symbols-outlined">close</span>Close</button>
                <Link onClick={() => handleUserMenuClose()} href={"/settings"}><button><span className="material-symbols-outlined">settings</span>Settings</button></Link>
                <button onClick={() => { handleUserMenuClose(); handleLogout({ session: session, setSession: setSession, router: router }) }} ><span className="material-symbols-outlined">logout</span>Log out</button>
            </div>
        </div>
        }

        {/* Filter Options */}
        <div className={`${styles.filterOptions} ${filterClicked && styles.filterActive}`}>
            <FilterButton label="All" option="All" icon="public" navbar={navbar} setNavbar={setNavbar} setFilterClicked={setFilterClicked} filterClicked={filterClicked} />
            <FilterButton label="Local" option="Local" icon="location_on" navbar={navbar} setNavbar={setNavbar} setFilterClicked={setFilterClicked} filterClicked={filterClicked} />
            <FilterButton label="Subscribed" option="Subscribed" icon="communities" navbar={navbar} setNavbar={setNavbar} setFilterClicked={setFilterClicked} filterClicked={filterClicked} />
        </div>

        {/* Sort Options */}
        <div className={`${styles.sortOptions} ${sortOptions && styles.sortOptionsActive}`}>
            <SortButton label="Active" option="Active" navbar={navbar} setNavbar={setNavbar} replaceIcon={<span className="active m-2"></span>} setSortOptions={setSortOptions} sortOptions={sortOptions} />
            <SortButton label="Hot" option="Hot" icon="whatshot" navbar={navbar} setNavbar={setNavbar} setSortOptions={setSortOptions} sortOptions={sortOptions} />
            <SortButton label="New" option="New" icon="history" navbar={navbar} setNavbar={setNavbar} setSortOptions={setSortOptions} sortOptions={sortOptions} />
            <SortButton label="Most Comments" option="MostComments" icon="arrows_more_up" navbar={navbar} setNavbar={setNavbar} setSortOptions={setSortOptions} sortOptions={sortOptions} />
        </div>

        { /* Mobile Menu Overlay */}
        <div onMouseUp={() => {handleUserMenuClose(); handleMenuClose()}} onTouchEnd={() => {handleUserMenuClose(); handleMenuClose()}} className={`${styles.overlay} z-50 ${(userMenu || menu) && styles.overlayActive}`}></div>
        
        {/* Filter Overlay */}
        <div onTouchEnd={() => handleFilterOverlayClose()} onMouseUp={() => handleFilterOverlayClose()} className={`${styles.overlay} z-10 ${(filterClicked || sortOptions) && styles.overlayActive}`}></div>
        </>
    )
}