import { Person } from "lemmy-js-client";


import styles from "../../styles/User/SmallUser.module.css"

export default function SmallUser({ user, userHover, baseUrl, setUserHover } : { user: Person, baseUrl: string, userHover: boolean, setUserHover: Function }) {
    if(!user) throw new Error("Passed User to SmallUser is undefined");

    return (
        <>
            <div onMouseOver={() => setUserHover(true)} onMouseLeave={() => setUserHover(false)} className={`${styles.wrapper} ${userHover && styles.active}`}>
                <div className={`${styles.userImage}`}>
                    {user.avatar && <img src={user.avatar} alt="User Avatar" width={20} height={20} />}
                </div>
                <div className={`${styles.content}`}>
                    <div className={`${styles.usernames}`}>
                        <span className={`${styles.display_name}`}>{user.display_name}</span>
                        <span className={`${styles.name}`}>@{user.name}</span>
                    </div>
                    
                    <div>
                        <span>{baseUrl}</span>
                    </div>
                </div>
                <a href={`https://${baseUrl}/u/${user.name}`} target="_blank"><span className="material-icons">link</span></a>
            </div>
        </>
    )

}