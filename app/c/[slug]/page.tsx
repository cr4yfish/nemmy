"use client";

import { usePathname } from "next/navigation"; 
import { useEffect, useState } from "react";
import { GetCommentsResponse, GetPostResponse, GetCommunityResponse } from "lemmy-js-client";

import { AutoMediaType } from "@/utils/AutoMediaType";
import Username from "@/components/User/Username";
import Comment from "@/components/Comment";
import PostList from "@/components/PostList";

import styles from "../../../styles/Pages/PostPage.module.css";

export default function Community() {
    const [communityData, setCommunityData] = useState<GetCommunityResponse>({} as GetCommunityResponse);
    const [communityDataError, setCommunityDataError] = useState(true);

    // community id
    const pathname = usePathname().split("/")[2];

    useEffect(() => {
        if(!communityDataError) return;
        (async () => {
            console.log("Loading Community data...");
            const data = await fetch(`/api/getCommunity?community_name=${pathname}`);
            const json = (await data.json());
            if(json.error) { 
                console.error(json.error)
                setCommunityDataError(true);
            } else {
                console.log(json);
                setCommunityDataError(false);
                console.log("Retrying community fetch...");   
                setCommunityData(json as GetCommunityResponse);
                return;
            }
        })();

    }, [pathname, communityDataError]);

    
    return (
        <main className="flex min-h-screen w-full flex-col items-center mt-4">
            <div className=" max-w-2xl">
                <img src={communityData?.community_view?.community?.banner} alt="" className="w-full h-full"/>
            </div>
            

            <div className="flex flex-row max-w-3xl mb-6 max-md:flex-col max-md:p-6">
                <div className="flex w-full h-full">
                    <img src={communityData?.community_view?.community?.icon} alt="" height={100} width={100} />
                </div>
                <div className="flex flex-col">
                    <h1 className=" text-3xl font-bold">c/{pathname}</h1>
                    <span>{communityData?.community_view?.community?.description}</span>
                </div>
            </div>
            
            <PostList fetchParams={{ community_name: pathname }} />
        
        </main>
    )
}