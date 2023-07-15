"use client";

import { usePathname } from "next/navigation"; 
import { useEffect, useState } from "react";
import { GetCommunityResponse } from "lemmy-js-client";
import { useNavbar } from "@/hooks/navbar";
import Username from "@/components/User/Username";
import PostList from "@/components/PostList";
import RenderMarkdown from "@/components/ui/RenderMarkdown";
import { useSession } from "@/hooks/auth";
import { subscribeToCommunity } from "@/utils/lemmy";

import styles from "@/styles/Pages/CommunityPage.module.css";
import { ClipLoader } from "react-spinners";

export default function Community() {
    const { navbar, setNavbar } = useNavbar();
    const { session } = useSession();
    const [communityData, setCommunityData] = useState<GetCommunityResponse>({} as GetCommunityResponse);
    const [communityDataError, setCommunityDataError] = useState(true);
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);

    const [subscribeLoading, setSubscribeLoading] = useState(false);

    useEffect(() => {
        setNavbar({ ...navbar!, showSort: false, showFilter: false, showSearch: true, showUser: true, showback: true })
    }, [])

    // community id
    const pathname = usePathname().split("/")[2];

    useEffect(() => {
        if(!communityDataError) return;
        (async () => {

            const data = await fetch(`/api/getCommunity?community_name=${pathname}`);
            const json = (await data.json());
            if(json.error) { 
                console.error(json.error)
                setCommunityDataError(true);
            } else {
                setCommunityDataError(false);
                setCommunityData(json as GetCommunityResponse);
                return;
            }
        })();

    }, [pathname, communityDataError]);

    const subscribe = async () => {
        if(subscribeLoading) return;
        setSubscribeLoading(true);
        if(!session || !communityData.community_view.community.id) return;
        const res = await subscribeToCommunity({ community_id: communityData.community_view.community.id, auth: session.jwt, follow: true });
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
        <img src={communityData?.community_view?.community?.banner} alt="" className={`${styles.banner}`} />
        <div className={`${styles.headerWrapper}`}>
            <div className="flex flex-row gap-4 p-6 max-w-xl max-md:w-full items-center flex-wrap">
                <img className={`${styles.icon} ${!communityData?.community_view?.community?.icon && "object-contain p-2"} `} src={communityData?.community_view?.community?.icon || "https://i.imgur.com/IN6ZY30.png"} alt=""  />
                <div className="flex flex-col h-full max-w-xl">
                    <h1 className=" text-3xl font-bold">c/{pathname}</h1>
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

        <div className={`${styles.sortsWrapper}`}>
            <div className={`${styles.sort}`}>
                <div className="flex flex-row items-center gap-0">
                    <span className="material-icons-outlined">whatshot</span>
                    <span>Hot</span>
                </div>
                
                <span className="material-icons">expand_more</span>
            </div>

            <div className="flex items-center">
                <span className="material-icons-outlined">view_day</span>
            </div>
        </div>


        <div className={`${styles.postsWrapper}`}>

            <PostList fetchParams={{ community_name: pathname }} />
        </div>

           
        
        
        </>
    )
}