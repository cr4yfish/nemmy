"use client"

import { useEffect, useState, useRef } from "react";

import { Person } from "lemmy-js-client";
import SmallUser from "./SmallUser";


import styles from "../../styles/User/Username.module.css"

export default function Username({ user, baseUrl } : { user: Person, baseUrl: string }) {
    const [userHover, setUserHover] = useState<boolean>(false);

    return (
        <>
           {user ? <div 
                className={`${styles.wrapper}`}
                
                >
                    <div 
                        className={`${styles.hovercatcher}`} 
                        onMouseOver={() => setUserHover(true)}
                        onMouseOut={() => setUserHover(false)}
                        >
                    </div>
                    <span>{user.avatar && <img className={`${styles.userimage}`} src={user.avatar} alt={user.name} width={10} height={10} /> }</span>
                    <span className="font-medium" >@{user.name}</span>
                <SmallUser 
                    user={user} 
                    userHover={userHover}
                    setUserHover={setUserHover}
                    baseUrl={baseUrl}
                    style={{ position: "absolute", top: "100%", left: "0" }}
                />
            </div>
            : 
            <span>Loading...</span>    
        }
           
        </>
    )
}