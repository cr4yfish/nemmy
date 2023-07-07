import { Person } from "lemmy-js-client";


import styles from "../../styles/User/SmallUser.module.css"
import { CSSProperties } from "react";
import { hostname } from "os";

export default function SmallUser({ user, userHover, setUserHover, style } : { user: Person, baseUrl: string, userHover: boolean, setUserHover: Function, style?: CSSProperties }) {
    if(!user) throw new Error("Passed User to SmallUser is undefined");

    const actor_id = new URL(user.actor_id);

    const baseUrl = actor_id.hostname;

    return (
        <>
            <div style={style} onMouseOver={() => setUserHover(true)} onMouseLeave={() => setUserHover(false)} className={`${styles.wrapper} ${userHover && styles.active}`}>
                {user.avatar &&
                <div className={`${styles.userImage}`}>
                    <img className={`${styles.avatar}`} src={user.avatar} alt="User Avatar" />
                </div>
                }
                <div className={`${styles.content}`}>
                    
                    <div className={`${styles.usernames}`}>
                        {user.display_name && <span className={`${styles.display_name}`}>{user.display_name}</span>}
                        <span className={`${styles.name}`}>@{user.name} {!user.local && !user.display_name && `on ${baseUrl}`}</span>
                    </div>
                </div>
                <a className="flex h-full" href={baseUrl == "lemmy.world" ? `u/${user.name}` : `https://${baseUrl}/u/${user.name}`} target="_blank"><span className="material-icons">open_in_new</span></a>
            </div>
        </>
    )

}