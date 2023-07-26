"use client"
import { Person } from "lemmy-js-client";
import Image from "next/image";
import { CSSProperties, useEffect, useState } from "react";
import Link from "next/link";
import { NumericFormat } from "react-number-format";

import { DEFAULT_INSTANCE, DEFAULT_AVATAR } from "@/constants/settings";

import styles from "../../styles/User/SmallUser.module.css"

export default function SmallUser({ user, userHover, setUserHover, style, opensToTop=false } : { user: Person, baseUrl: string, userHover: boolean, setUserHover: Function, style?: CSSProperties, opensToTop?: boolean }) {
    const [userData, setUserData] = useState<Person>({} as Person);
    const [karma, setKarma] = useState<number>(0);

    if(!user) throw new Error("Passed User to SmallUser is undefined");

    const actor_id = new URL(user.actor_id);

    const baseUrl = actor_id.hostname;
    
    const getUserData = async () => {
        if(baseUrl !== DEFAULT_INSTANCE.replace("https://", "")) return;

        const data = await fetch(`/api/getUser?username=${user.name}&baseUrl=${baseUrl}`);
        const json = (await data.json());
        if(json.error) {
            console.error(json.error)
        }
        setUserData(json as Person);

        let post_score= json?.person_view?.counts?.post_score;
        let comment_score = json?.person_view?.counts?.comment_score;
        let post_count = json?.person_view?.counts?.post_count;
        let comment_count = json?.person_view?.counts?.comment_count;
        
        let comment_amount = json?.comments?.length;
        let post_amount = json?.posts?.length;
    
        let tmp = Math.ceil(((post_score*0.9 + comment_score*0.5) + (comment_amount*0.5 + post_amount*0.9)) / (post_count*0.75 + comment_count*0.25)*20)
        setKarma(tmp);
    }

    useEffect(() => {
        //getUserData();
    }, [user])

    return (
        <>
            <div 
                style={style} 
                onMouseOver={() => setUserHover(true)} 
                onMouseLeave={() => setUserHover(false)} 
                className={`${styles.wrapper} ${opensToTop ? "-translate-y-full" : "translate-y-1/4"} ${userHover && styles.active} ${userHover && opensToTop && styles.activeToTop}`}>
                
                <div className={`${styles.userImage}`}>
                    <Image 
                        className={`${styles.avatar} ${user.avatar ? "" : "object-contain p-1"}`} 
                        src={user.avatar || DEFAULT_AVATAR} 
                        alt="" 
                        width={48}
                        height={48}
                    />
                </div>
            
                <div className={`${styles.content}`}>
                    
                    <div className={`${styles.usernames}`}>
                        {user.display_name && <span className={`${styles.display_name}`}>{user.display_name}</span>}
                        <span className={`${styles.name}`}><span className=" select-all ">@{user.name}</span> {!user.local && !user.display_name && `on ${baseUrl}`}</span>
                    </div>
                </div>
                {karma > 0 && <span className="snack"><NumericFormat displayType="text" className="flex bg-transparent w-full appearance-none " value={karma} thousandSeparator /> Points</span>}
                <Link className="flex h-full" href={`/u/${user.name}@${baseUrl}`} target="_blank"><span className="material-icons">open_in_new</span></Link>
            </div>
        </>
    )

}