import { Person } from "lemmy-js-client";


import styles from "../../styles/User/SmallUser.module.css"
import { CSSProperties } from "react";
import Link from "next/link";

export default function SmallUser({ user, userHover, setUserHover, style, opensToTop=false } : { user: Person, baseUrl: string, userHover: boolean, setUserHover: Function, style?: CSSProperties, opensToTop?: boolean }) {
    if(!user) throw new Error("Passed User to SmallUser is undefined");

    const actor_id = new URL(user.actor_id);

    const baseUrl = actor_id.hostname;

    return (
        <>
            <div 
                style={style} 
                onMouseOver={() => setUserHover(true)} 
                onMouseLeave={() => setUserHover(false)} 
                className={`${styles.wrapper} ${opensToTop ? "-translate-y-full" : "translate-y-1/4"} ${userHover && styles.active} ${userHover && opensToTop && styles.activeToTop}`}>
                
                <div className={`${styles.userImage}`}>
                    <img 
                        className={`${styles.avatar} ${user.avatar ? "" : "object-contain p-1"}`} 
                        src={user.avatar || "https://i.imgur.com/IN6ZY30.png"} 
                        alt="" 
                    />
                </div>
            
                <div className={`${styles.content}`}>
                    
                    <div className={`${styles.usernames}`}>
                        {user.display_name && <span className={`${styles.display_name}`}>{user.display_name}</span>}
                        <span className={`${styles.name}`}>@{user.name} {!user.local && !user.display_name && `on ${baseUrl}`}</span>
                    </div>
                </div>
                <Link className="flex h-full" href={baseUrl == "lemmy.world" ? `/u/${user.name}` : `https://${baseUrl}/u/${user.name}`} target="_blank"><span className="material-icons">open_in_new</span></Link>
            </div>
        </>
    )

}