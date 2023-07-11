/* eslint-disable @next/next/no-img-element */
"use client"
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/hooks/auth";
import { useNavbar, NavbarState } from "@/hooks/navbar";
import styles from "../styles/Navbar.module.css";
import { handleLogout } from "@/utils/authFunctions";
import { useRouter } from "next/navigation"; 
import { ListingType, SortType } from "lemmy-js-client";

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


export default function Navbar() {
    const { session, setSession } = useSession();
    const { navbar, setNavbar } = useNavbar();
    const [isSearching, setIsSearching] = useState(false);
    const [filterClicked, setFilterClicked] = useState(false);
    const [sortOptions, setSortOptions] = useState(false);
    const [userMenu, setUserMenu] = useState(false);
    const [menu, setMenu] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        alert("This isn't doing anything yet.")
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

    if(navbar?.hidden) return null;


    return (
        <>
        <nav className={`${styles.wrapper} ${navbar?.hidden && "hidden"}`}>    

            <div className="flex flex-row items-center gap-6">
                <a href="/" className={styles.logo}>Nemmy</a>

                <div className="flex flex-row gap-4 items-center">

                    { navbar?.showMenu &&
                    
                    <button onClick={() => handleMenuOpen()} className={`${styles.menuButton}`}>
                        <span className="material-icons">menu</span>
                    </button>
                    }

                    { navbar?.showback &&
                    <div className={`${styles.backButton}`}>
                        <button className="flex items-center gap-2" onClick={() => router.back()}><span className="material-icons">arrow_back</span>Back</button>
                    </div>
                    }
                    
                    { navbar?.showFilter &&
                    <button className={`${styles.navButton}`} onClick={() =>{ setFilterClicked(!filterClicked); setSortOptions(false); handleUserMenuClose(); setNavbar({...navbar, overlayActive: !filterClicked})  }}>
                        <div>
                            <span className="material-icons">filter_list</span>
                            <span className={`${styles.navButtonText}`}>All</span>
                        </div>
                        <span className="material-icons">arrow_drop_down</span> 
                    </button> 
                    }

                    { navbar?.showSort &&
                    <button className={`${styles.navButton}`} onClick={() =>{ setSortOptions(!sortOptions); handleUserMenuClose(); handleMenuClose(); setFilterClicked(false); setNavbar({...navbar, overlayActive: !sortOptions})  }} >
                        <div className="flex items-center gap-1">
                            <span className="material-icons-outlined">sort</span>
                            <span className={`${styles.navButtonText}`}>Hot</span>
                        </div>
                        <span className="material-icons">arrow_drop_down</span> 
                    </button>
                    }
                </div>

                

            </div>
            

            

          

            <div className="flex flex-row items-center gap-4">

                { navbar?.showSearch &&
                <form onSubmit={(e) => handleSubmit(e)} className={`${styles.navButton} ${styles.searchWrapper} ${isSearching && styles.searchWrapperActive}`}>
                    <span className="material-icons">search</span>
                    
                    {isSearching && <input onBlur={(e) => e.currentTarget.value.length == 0 && setIsSearching(false)} className={`${styles.search}`} type="text" placeholder="Search" />}
                </form>
                }

                
                { navbar?.showUser &&
                <>
                 {session.jwt.length > 0 ? 
                    <button onClick={() => { handleFilterOverlayClose(); handleUserMenuOpen(); setNavbar({ ...navbar, overlayActive: true }) }}  className={`${styles.userWrapper} cursor-pointer select-none`}>
                        <div className={styles.userImage}><img src={session.user.my_user?.local_user_view.person?.avatar || "https://i.imgur.com/IN6ZY30.png" } alt={"Account"} /></div>
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

        {/* Mobile Menu Left Side */}
        <div id="menu" className={`${styles.menu} ${menu && styles.menuActive}`}>
            <div className={`flex flex-col h-fit gap-6`}>
                <button className={`${styles.currentInstance}`} onClick={() => alert("Soon you'll be able to see Instance Details here.")} >
                    <div className="flex flex-col">
                        <span className=" uppercase font-bold text-xs dark:text-fuchsia-300">Current Instance</span>
                        <span className="font-bold ">Lemmy.world</span>
                    </div>
                    
                    <span className="material-symbols-outlined">expand_content</span>
                </button>

                <div className={`${styles.menuLinks}`}>
                    <Link onClick={() => handleMenuClose()} href={"/"}><button><span className="material-icons">home</span>Home</button></Link>
                </div>

            </div>
            <div className={`flex flex-col gap-2`}>
                <div className="flex items-center gap-1 justify-between">
                    <span className="font-bold">Communities</span>
                    <span className="material-symbols-outlined">arrow_drop_down</span>
                </div>
               
                <div className={`flex flex-col gap-2`}>
                    <Link href={"/c/Nemmy"} onClick={() => handleMenuClose()} className={`${styles.menuCommunity}`}>
                        <img className="w-10 h-10 overflow-hidden rounded-full" src="https://lemmy.world/pictrs/image/5194b9c5-bee3-4363-aaf9-3e57251fb0a7.png?format=webp" alt="" />
                        <span>c/Nemmy</span>
                    </Link>
                </div>
            </div>
        </div>

        {/* User Menu Right Side */}
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
                        <button onClick={() => alert("Multiple Accounts are work in progress :)")}><span className="material-icons">add_circle</span></button>
                    </div>
                </div>

                <div className={`${styles.userMenuInteractionsTop}`}>
                    <button><span className="material-icons-outlined">notifications</span>Notifications</button>
                    <Link onClick={() => handleUserMenuClose()} href={`/u/${session?.user.my_user?.local_user_view?.person?.name}`}><button><span className="material-icons-outlined">account_circle</span>My Profile</button></Link>
                    <button><span className="material-icons-outlined">add_circle_outline</span>Create a Post</button>
                    <button><span className="material-icons-outlined">group_add</span>Create a Community</button>
                    <button><span className="material-icons-outlined">bookmarks</span>Bookmarked</button>
                </div>


            </div>

            <div className={`${styles.userMenuInteractionsBottom}`}>
                <button onClick={() => handleUserMenuClose()}><span className="material-icons-outlined">close</span>Close</button>
                <button><span className="material-icons-outlined">settings</span>Settings</button>
                <button onClick={() => { handleUserMenuClose(); handleLogout({ session: session, setSession: setSession, router: router }) }} ><span className="material-icons-outlined">logout</span>Log out</button>
            </div>
        </div>

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