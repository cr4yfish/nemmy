"use client"

import { getCookies, setCookie } from "cookies-next";
import { GetPersonDetailsResponse, GetSiteResponse, LemmyHttp, PersonView } from "lemmy-js-client"
import { FormEvent, useState } from "react";
import { useSession } from "@/hooks/auth";

import styles from "@/styles/Pages/LoginPage.module.css";

export default function Login() {
    const { session, setSession } = useSession();

    const [form, setForm] = useState<{ username: string, password: string, saveLogin: boolean}>({
        username: "",
        password: "",
        saveLogin: false
    })

    const handleSubmit = async (e: FormEvent) => {
        try {
            e.preventDefault();
            let usernameEle = (e.target as HTMLFormElement).elements[0] as any;
            let passwordEle = (e.target as HTMLFormElement).elements[1] as any;
            let saveLoginEle = (e.target as HTMLFormElement).elements[2] as any;    
    
            let username: string = usernameEle.value;
            let password: string = passwordEle.value;
            let saveLogin: boolean = saveLoginEle.checked;

            // first check if jwt in session storage
            const sessionJwt = sessionStorage.getItem("jwt");
            if (sessionJwt) {
                const user = await getUserDetails(sessionJwt);
                return;
            } else {
                // fallback to cookies
                const cookies = getCookies();
                const jwt = cookies.jwt;
                if (jwt) {
                    const user = await getUserDetails(jwt);
                    return;
                }
            }

            // if not, try to login
    
            // get jwt token
            const jwt = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            }).then(res => res.json());
            
            saveLogin && setCookie("jwt", jwt.jwt, { maxAge: 60 * 60 * 24 * 7})
            sessionStorage.setItem("jwt", jwt.jwt);
            
            // get user details
            const user = await getUserDetails(jwt.jwt);
    
        } catch (e: any) {
            console.log(e.message);
        }
    }

    const getUserDetails = async (jwt: string) => {
        const user: GetSiteResponse = await fetch(`/api/getSite?auth=${jwt}`).then(res => res.json());
        setSession({ jwt: jwt, user: user })
        return user as GetSiteResponse;
    }

    return (
        <main className="flex items-center justify-start p-2 w-full flex-col">

            <div className="flex items-center flex-col gap-4">
                <h1 className="font-bold text-3xl">Login</h1>
                <form onSubmit={(e) => handleSubmit(e)} className={`${styles.loginWrapper}`}>
                    <div className={`${styles.inputWrapper}`}>
                        <label htmlFor="">Username</label>
                        <input required type="email" />
                    </div>
                    <div className={`${styles.inputWrapper}`}>
                        <label htmlFor="">Password</label>
                        <input required type="password" />
                    </div>
                    <div className={`${styles.inputWrapper}`}>
                        <label htmlFor="">Save login</label>
                        <input type="checkbox" id="saveLogin" />
                    </div>
                    <button className={`${styles.button}`} type="submit">Login</button>
                </form>
                
            </div>

        </main>
    )
}