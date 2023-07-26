
"use client";

import { usePathname } from "next/navigation"; 
import { useEffect, useState } from "react";
import { GetCommunityResponse, SortType } from "lemmy-js-client";
import { ClipLoader } from "react-spinners";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { useNavbar } from "@/hooks/navbar";
import { useSession } from "@/hooks/auth";

import Username from "@/components/User/Username";
import PostList from "@/components/PostList";
import RenderMarkdown from "@/components/ui/RenderMarkdown";
import SortButton from "../ui/SortButton";

import { subscribeToCommunity } from "@/utils/lemmy";

import { DEFAULT_AVATAR, DEFAULT_SORT_TYPE } from "@/constants/settings";

import styles from "@/styles/Pages/CommunityPage.module.css";

export default function CommunityPage({ initialCommunity, communityInstance }: { initialCommunity: GetCommunityResponse, communityInstance: string}) {
    const { navbar, setNavbar } = useNavbar();
    const { session } = useSession();
    const [communityData, setCommunityData] = useState<GetCommunityResponse>(initialCommunity);
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);
    const [currentSort, setCurrentSort] = useState<SortType>(DEFAULT_SORT_TYPE);

    const [subscribeLoading, setSubscribeLoading] = useState(false);

    useEffect(() => {
        setNavbar({ ...navbar!, showSort: false, showFilter: false, showSearch: true, showUser: true, showback: true, titleOverride: "" })
    }, [])

    const subscribe = async () => {
        if(subscribeLoading) return;
        setSubscribeLoading(true);
        if(!session || !session.currentAccount || !communityData.community_view.community.id) return;
        const res = await subscribeToCommunity({ community_id: communityData.community_view.community.id, auth: session.currentAccount.jwt, follow: true });
        if(!res) {
            console.error("Could not follow community");
        } else {
            setCommunityData({...communityData, community_view: {...communityData.community_view, subscribed: "Subscribed"}});
        }
        setSubscribeLoading(false);
    }
    
    return (
        <>
        <div className={`${styles.bannerOverlay} mt-20`}></div>
        <Image height={200} width={500} src={communityData?.community_view?.community?.banner || ""} alt="" className={`${styles.banner}`} />
        <div className={`${styles.headerWrapper}`}>
            <div className="flex flex-row gap-4 p-6 max-w-xl max-md:w-full items-center flex-wrap">
                <Image height={40} width={40} className={`${styles.icon} ${!communityData?.community_view?.community?.icon && "object-contain p-2"} `} src={communityData?.community_view?.community?.icon || DEFAULT_AVATAR} alt=""  />
                <div className="flex flex-col h-full max-w-xl">
                    <h1 className=" text-xl font-bold">{communityData.community_view.community.title}</h1>
                    <span className=" text-xs text-neutral-500">@{communityInstance}</span>
                    <div className="flex flex-row flex-wrap gap-2 pt-2">
                        <span className="snack"><span className="material-symbols-outlined">communities</span> {communityData?.community_view?.counts?.subscribers} Subscribers</span>
                        <span className="snack"><span className="material-symbols-outlined">group</span> {communityData.community_view?.counts?.users_active_day} Users / Day</span>
                    </div>
                    
                </div>
                {communityData?.community_view?.subscribed == "NotSubscribed" && <button onClick={() => subscribe()} className={`${styles.subscribeButton}`}>{subscribeLoading ? <ClipLoader color={"#e6b0fa"} size={20} /> : "Subscribe"}</button>}
            </div>
            
            <div className={`${styles.description}`}>
                <button onClick={() => setDescriptionExpanded(true)} className={`${styles.expandButton} ${descriptionExpanded && "hidden"}`}>Tap to expand</button>
                <div className={`${styles.descriptionOverlay}  ${descriptionExpanded && "hidden"}`}></div>
                <div className={`${styles.descriptionContent} ${descriptionExpanded && styles.descriptionContentExpanded} `}>
                    <span className="font-bold">Community Description</span>
                    {communityData?.community_view?.community?.description ? <RenderMarkdown>{communityData?.community_view?.community?.description}</RenderMarkdown>
                    :
                    <div className=" italic ">This community does not have a description</div>
                    }
                    <div className="flex flex-col mt-4"> 
                        <span className="font-bold">Moderators</span>
                        <div className={`${styles.mods}`}>
                            {communityData?.moderators?.map((moderator) => (
                                <Username user={moderator?.moderator} baseUrl="" key={moderator?.moderator?.id} opensToTop />
                            ))}
                        </div>
                    </div>
                    
                </div>
                <button onClick={() => setDescriptionExpanded(false)} className={`p-4 mt-2 ${!descriptionExpanded && "hidden"}`}>Collapse</button>
            </div>

        </div>   

        <div className={`${styles.sortsWrapper} relative`}>
            <SortButton 
                onChange={(newSort) => setCurrentSort(newSort)}
            />

            <div className="flex items-center">
                <span className="material-icons-outlined">view_day</span>
            </div>

        </div>


        <div className={`${styles.postsWrapper}`}>

            <PostList 
                fetchParams={{ 
                    community_name: `${communityData.community_view.community.name}@${communityInstance}` ,
                    sort: currentSort,
                }} 
            />
        </div>
        
        </>
    )
}