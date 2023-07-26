"use client"
import Link from "next/link";
import Marquee from "react-fast-marquee";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Scrollbar } from "swiper/modules";
import 'swiper/css';
import 'swiper/css/scrollbar';
import { motion } from "framer-motion";

import { DEFAULT_AVATAR } from "@/constants/settings";
import { useSession } from "@/hooks/auth";

import styles from "@/styles/components/Navbar/UserMenu.module.css";
import { Account, switchToAccount } from "@/utils/authFunctions";

export default function UserMenu( {
    handleUserMenuClose, handleLogout, unreadCount, router
 } : { 
    handleUserMenuClose: any, handleLogout: any, unreadCount: any, router: any }) {
    const { session, setSession } = useSession();


    const handleSwitchAccount = (account: Account) => {
        switchToAccount(account, setSession);
    }

    return (
        <>
        <motion.div 
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0, transition: { bounce: 0 } }}
            exit={{ opacity: 0, x: 300 }}
            id="usermenu" 
            className={`${styles.userMenu}`}
        >
            <div className={`flex flex-col gap-4 h-full w-full`}>

                {<Swiper 
                    modules={[Mousewheel, Scrollbar]}
                    className="h-52 w-full"
                    spaceBetween={50}
                    slidesPerView={1}
                    mousewheel={{
                        forceToAxis: true,
                        releaseOnEdges: true,
                    }}
                    scrollbar={{
                        draggable: true,
                    }}
                    >

                    {session.accounts.map((account, index) => (
                        <SwiperSlide onClick={() => handleSwitchAccount(account)} key={index} className={`${styles.userProfile} ${(account.username == session.currentAccount?.username) && styles.userProfileActive} cursor-pointer`}>
                            <Image width={100} height={50} className={`${styles.userProfileBanner}`} src={account?.user?.person.banner || ""} alt="" />
                            <div className={`${styles.userProfileBannerOverlay}`}></div>
                            <Image width={40} height={40} className={`${styles.userProfileAvatar}`} src={account.user?.person?.avatar || DEFAULT_AVATAR} alt="" />
                            <div className={`${styles.userProfileText}`}>
                                <span className={`${styles.userProfileUsername} text-xs`}>{account.instance}</span>
                                {account.username.length > 30 ? <Marquee><span className={`${styles.userProfileDisplayName} text-sm`}>u/{account.username}</span></Marquee>
                                :
                                <span className={`${styles.userProfileDisplayName} text-sm`} >u/{account.username}</span>
                                }
                            </div>
                        </SwiperSlide>
                    ))}

                    <SwiperSlide className="flex justify-center items-center w-12 h-48 px-6">
                        <Link href={"/auth"}>
                            <button 
                                onClick={() => handleUserMenuClose()} 
                                className="flex justify-center items-center flex-col gap-2 h-full w-full
                                     bg-fuchsia-200 border-2 border-transparent hover:border-fuchsia-700 
                                     transition-all duration-100 ease-in-out p-6 rounded-lg"
                            >
                                <span className="material-symbols-outlined text-fuchsia-700">add</span>
                                <span className=" text-fuchsia-700 font-medium">Add another Account</span>
                            </button>
                        </Link>
                    </SwiperSlide>
                </Swiper>}

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
                    <Link onClick={() => handleUserMenuClose()} href={`/u/${session.currentAccount?.user?.person?.name}@${session.currentAccount?.instance}`}><button><span className="material-symbols-outlined">account_circle</span>My Profile</button></Link>
                    <Link onClick={() => handleUserMenuClose()} href="/post/new"><button><span className="material-symbols-outlined">add_circle_outline</span>Create a Post</button></Link>
                    <Link onClick={() => handleUserMenuClose()} href={"/c/new"}><button><span className="material-symbols-outlined">group_add</span>Create a Community</button></Link>
                    <button className="text-neutral-400 dark:text-neutral-500 cursor-not-allowed"><span className="material-symbols-outlined">bookmarks</span>Bookmarked</button>
                    <Link onClick={() => handleUserMenuClose()} href={"/chat"}><button><span className="material-symbols-outlined">chat</span>Chat</button></Link>
                </div>


            </div>

            <div className={`${styles.userMenuInteractionsBottom}`}>
                <button onClick={() => handleUserMenuClose()}><span className="material-symbols-outlined">close</span>Close</button>
                <Link onClick={() => handleUserMenuClose()} href={"/settings"}><button><span className="material-symbols-outlined">settings</span>Settings</button></Link>
                <button onClick={() => { handleUserMenuClose(); handleLogout({ session: session, setSession: setSession, router: router, account: session.currentAccount }) }} ><span className="material-symbols-outlined">logout</span>Log out</button>
            </div>
        </motion.div>
        </>
    )
}