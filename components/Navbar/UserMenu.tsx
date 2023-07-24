"use client"
import Link from "next/link";
import Marquee from "react-fast-marquee";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { DEFAULT_INSTANCE, DEFAULT_AVATAR } from "@/constants/settings";
import { useSession } from "@/hooks/auth";

import styles from "@/styles/components/Navbar/UserMenu.module.css";
import { Account, switchToAccount } from "@/utils/authFunctions";

export default function UserMenu( {
    active, handleUserMenuClose, handleLogout, unreadCount, handleCloseSearchOverlay, router
 } : { 
    active: boolean, handleUserMenuClose: any, handleLogout: any, unreadCount: any, handleCloseSearchOverlay: any, router: any }) {
    const { session, setSession } = useSession();


    const handleSwitchAccount = (account: Account) => {
        console.log("Switching account to", account);
        switchToAccount(account, setSession);
    }

    return (
        <>
        <div id="usermenu" className={`${styles.userMenu} ${active && styles.userMenuActive}`}>
            <div className={`${styles.userMenuTop}`}>

                <div className={`${styles.userProfiles}`}>

                    {session.accounts.map((account, index) => (
                        <div onClick={() => handleSwitchAccount(account)} key={index} className={`${styles.userProfile} ${(account.username == session.currentAccount?.username) && styles.userProfileActive} cursor-pointer`}>
                            <Image width={100} height={50} className={`${styles.userProfileBanner}`} src={account?.user?.person.banner || ""} alt="" />
                            <div className={`${styles.userProfileBannerOverlay}`}></div>
                            <Image width={40} height={40} className={`${styles.userProfileAvatar}`} src={account.user?.person?.avatar || DEFAULT_AVATAR} alt="" />
                            <div className={`${styles.userProfileText}`}>
                                <span className={`${styles.userProfileUsername} text-xs`}>{account.instance}</span>
                                {account.username.length > 15 ? <Marquee><span className={`${styles.userProfileDisplayName} text-sm`}>u/{account.username}</span></Marquee>
                                :
                                <span className={`${styles.userProfileDisplayName} text-sm`} >u/{account.username}</span>
                                }
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-center items-center w-12 h-52 px-6">
                        <Link href={"/auth"}><button onClick={() => handleUserMenuClose()}><span className="material-symbols-outlined">add</span></button></Link>
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
                    <Link onClick={() => handleUserMenuClose()} href={`/u/${session.currentAccount?.user?.person?.name}@${session.currentAccount?.instance}`}><button><span className="material-symbols-outlined">account_circle</span>My Profile</button></Link>
                    <Link onClick={() => handleUserMenuClose()} href="/post/new"><button><span className="material-symbols-outlined">add_circle_outline</span>Create a Post</button></Link>
                    <button className="text-neutral-400 dark:text-neutral-500 cursor-not-allowed"><span className="material-symbols-outlined">group_add</span>Create a Community</button>
                    <button className="text-neutral-400 dark:text-neutral-500 cursor-not-allowed"><span className="material-symbols-outlined">bookmarks</span>Bookmarked</button>
                    <Link onClick={() => handleUserMenuClose()} href={"/chat"}><button><span className="material-symbols-outlined">chat</span>Chat</button></Link>
                </div>


            </div>

            <div className={`${styles.userMenuInteractionsBottom}`}>
                <button onClick={() => handleUserMenuClose()}><span className="material-symbols-outlined">close</span>Close</button>
                <Link onClick={() => handleUserMenuClose()} href={"/settings"}><button><span className="material-symbols-outlined">settings</span>Settings</button></Link>
                <button onClick={() => { handleUserMenuClose(); handleLogout({ session: session, setSession: setSession, router: router, account: session.currentAccount }) }} ><span className="material-symbols-outlined">logout</span>Log out</button>
            </div>
        </div>
        </>
    )
}