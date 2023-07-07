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
                onMouseOver={() => setUserHover(true)}
                onMouseOut={() => setUserHover(false)}
                >
                    <div 
                        className={`${styles.hovercatcher}`} 
                        
                        >
                    </div>
                    <span>
                        <img 
                            className={`${styles.userimage} ${user.avatar ? "" : "object-contain"} `} 
                            src={user.avatar || "https://i.imgur.com/IN6ZY30.png"} 
                            alt={user.name} 
                        />
                    </span>
                    <span className="font-medium" >{user.name}</span>
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