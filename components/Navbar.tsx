"use client"
import { useState } from "react";

import styles from "../styles/Navbar.module.css";

export default function Navbar() {
    const [isSearching, setIsSearching] = useState(false);


    return (
        <>
        <nav className={styles.wrapper}>    
            <div className={styles.logo}>Nemmy</div>
            <div className={`${styles.searchWrapper} ${isSearching && styles.searchWrapperActive}`}>
                <span className="material-icons">search</span>
                <input onFocus={(e) => setIsSearching(true)} onBlur={(e) => e.currentTarget.value.length == 0 && setIsSearching(false)} className={`${styles.search}`} type="text" placeholder="Search" />
                <a className={`${styles.searchIcon} ${isSearching && styles.searchIconActive}`} target="_blank">
                    <span className="material-icons">arrow_circle_right
                    </span>
                </a>
            </div>
            <div className={styles.userWrapper}>
                <div className={styles.userImage}>
                </div>
                <span className={`${styles.username}`}>username</span>
            </div>
        </nav>
        </>
    )
}