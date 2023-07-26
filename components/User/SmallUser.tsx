"use client"
import { Person } from "lemmy-js-client";
import Image from "next/image";
import { CSSProperties, useEffect, useState } from "react";
import Link from "next/link";
import { ClipLoader } from "react-spinners";

import { useSession } from "@/hooks/auth";

import { FormatNumber } from "@/utils/helpers";

import { DEFAULT_INSTANCE, DEFAULT_AVATAR } from "@/constants/settings";

import styles from "../../styles/User/SmallUser.module.css"

export default function SmallUser({ user, userHover, setUserHover, style, opensToTop=false } : { user: Person, baseUrl: string, userHover: boolean, setUserHover: Function, style?: CSSProperties, opensToTop?: boolean }) {
    const { session } = useSession();
    const [userData, setUserData] = useState<Person>({} as Person);
    const [loading, setLoading] = useState<boolean>(false);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [karma, setKarma] = useState<number>(0);

    if(!user) throw new Error("Passed User to SmallUser is undefined");

    const actor_id = new URL(user.actor_id);

    const baseUrl = actor_id.hostname;
    
    const getUserData = async () => {
        if(loading) return;
        setLoading(true);

        const userUrl = `${user.name}@${new URL(user.actor_id).host}`;

        const data = await fetch(`/api/getUser?username=${userUrl}&instance=${session.currentAccount?.instance}`);
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
        setLoading(false);
    }

    // Will only run once when opening, after that is cached
    useEffect(() => {
        if(userHover && !loaded) {
            setLoaded(true)
            getUserData()
        };
    }, [user, userHover])

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
                {loading && <span className="snack"><ClipLoader color="#78350f" size={10} /></span>}
                {karma > 0 &&
                    <span className="snack">
                        <span>{FormatNumber(karma, true)}</span>
                        Points
                    </span>}
                <Link className="flex h-full" href={`/u/${user.name}@${baseUrl}`} target="_blank"><span className="material-icons">open_in_new</span></Link>
            </div>
        </>
    )

}