"use client"
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSession } from "@/hooks/auth";
import { useNavbar } from "@/hooks/navbar";
import styles from "../styles/Navbar.module.css";
import Username from "./User/Username";

export default function Navbar() {
    const { session } = useSession();
    const { navbar } = useNavbar();
    const [isSearching, setIsSearching] = useState(false);
    const [filterClicked, setFilterClicked] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        alert("This isn't doing anything yet.")
    }


    const AutoLink = ({ href, children, className } : { href: string, children: any, className: string }) => {
        return session?.user?.my_user?.local_user_view?.person?.name ?
        <Link className={className} href={href}>{children}</Link> 
        : 
        <div className={className}>{children}</div>
    }

    return (
        <>
        <nav className={`${styles.wrapper} ${navbar?.hidden && "hidden"}`}>    
            <a href="/" className={styles.logo}>Nemmy</a>

            { navbar?.showSort &&
            <div className={`${styles.filter}`}>
                <button className={`${styles.filterTitle}`} onClick={() => setFilterClicked(!filterClicked)}><span className="material-icons" >filter_list</span><span className={`${styles.filterTitleText}`}>Filter</span> </button> 
                <div className={`${styles.filterOptions} ${filterClicked && styles.filterActive}`}>
                    <button ><span className="material-icons">home</span>Home</button>
                    <button><span className="material-icons">trending_up</span>Trending</button>
                </div>
            </div>
            }

            { navbar?.showback &&
            <div className={`${styles.backButton}`}>
                <button className="flex items-center gap-2" onClick={() => window.history.back()}><span className="material-icons">arrow_back</span>Back</button>
            </div>
            }

            { navbar?.showSearch &&
            <form onSubmit={(e) => handleSubmit(e)} className={`${styles.searchWrapper} ${isSearching && styles.searchWrapperActive}`}>
                <span className="material-icons">search</span>
                <input onFocus={(e) => setIsSearching(true)} onBlur={(e) => e.currentTarget.value.length == 0 && setIsSearching(false)} className={`${styles.search}`} type="text" placeholder="Search" />
                <a className={`${styles.searchIcon} ${isSearching && styles.searchIconActive}`} target="_blank">
                    <button type="submit" className={`${styles.submitButton}`}>
                        <span className="material-icons">arrow_circle_right
                        </span>
                    </button>
                </a>
            </form>
            }

            
            { navbar?.showUser &&
            <AutoLink href={`/u/${session?.user?.my_user?.local_user_view?.person?.name}`} className={`${styles.userWrapper} cursor-pointer select-none`}>
                {session?.user?.my_user?.local_user_view?.person?.avatar?
                    <div className={styles.userImage}><img src={session.user.my_user.local_user_view.person.avatar} /></div>
                : <span className={`material-icons`}>person</span>
                }
                <span>{session?.user?.my_user?.local_user_view?.person?.name || <a href="/auth"><button>Login</button></a>}</span>
            </AutoLink>
            }
            
        </nav>
        </>
    )
}