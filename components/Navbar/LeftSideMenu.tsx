"use client"
import Link from "next/link"
import { useState } from "react"

import { useSession } from "@/hooks/auth"
import { DEFAULT_INSTANCE, DEFAULT_AVATAR } from "@/constants/settings"
import Input from "../ui/Input"
import { motion, AnimatePresence } from "framer-motion"

import SiteInfo from "./SiteInfo"

import styles from "@/styles/components/Navbar/LeftSideMenu.module.css"
import Image from "next/image"

export default function LeftSideMenu(
    { menu, handleMenuClose, setCommunitySearch, communitySearch 
    } : { 
    menu: boolean, handleMenuClose: any, setCommunitySearch: any, communitySearch: any 
    }) {
    const { session } = useSession();
    const [showSiteInfo, setShowSiteInfo] = useState(false)

    return (
        <>
        <AnimatePresence  >
            {showSiteInfo && session.siteResponse &&
                <SiteInfo siteResponse={session.siteResponse} close={() => setShowSiteInfo(false)} />
            }
        </AnimatePresence>
        <div id="menu" className={`${styles.menu} ${menu && styles.menuActive} overflow-y-auto`}>
            <div className={`flex flex-col h-fit gap-6 relative `}>
                <button className={`${styles.currentInstance}`} onClick={() => setShowSiteInfo(true)} >
                    <div className="flex flex-col justify-start items-start">
                        <span className=" uppercase font-bold text-xs dark:text-fuchsia-300">Current Instance</span>
                        <span className="font-bold ">{session.currentAccount?.instance || DEFAULT_INSTANCE}</span>
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
                    {session?.siteResponse?.my_user?.follows?.filter((c) => c.community.name.includes(communitySearch)).map((community, index) => (
                        <div key={index}>
                            <Link href={`/c/${community.community.name}`} onClick={() => handleMenuClose()} className={`${styles.menuCommunity}`}>
                                <Image height={40} width={40} className="w-10 h-10 overflow-hidden rounded-full" src={community?.community?.icon || DEFAULT_AVATAR } alt="" />
                                <span className=" capitalize ">{community.community.name}</span>
                            </Link>                 
                        </div>
                    ))}
                </div>
            </div>
        </div>
        </>
    )
}