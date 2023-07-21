"use client"

import { getCookies, setCookie } from "cookies-next";
import { GetPersonDetailsResponse, GetSiteResponse, LemmyHttp, PersonView } from "lemmy-js-client"
import { FormEvent, useState, useRef, useEffect } from "react";
import { useSession } from "@/hooks/auth";
import Logo from "@/components/Logo";
import { useRouter } from "next/navigation"; 
import Link from "next/link";
import { CircleLoader, ClipLoader } from "react-spinners";
import { search } from "@/utils/lemmy";
import { DEFAULT_AVATAR } from "@/constants/settings";

import styles from "@/styles/Pages/LoginPage.module.css";
import { setCookies } from "@/utils/authFunctions";

export default function Login() {
    const { session, setSession } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [inputFocus, setInputFocus] = useState<boolean>(false);
    const [users, setUsers] = useState<PersonView[]>([]);
    const [selectedUser, setSelectedUser] = useState<PersonView | null>(null);
    const [loginError, setLoginError] = useState<boolean>(false);

    const [form, setForm] = useState<{ username: string, password: string, saveLogin: boolean, instance: string}>({
        username: "",
        password: "",
        saveLogin: false,
        instance: "",
    })

    useEffect(() => {
        if(!selectedUser?.person.name) return;
        setForm({
            ...form,
            username: selectedUser.person.name,
            instance: new URL(selectedUser.person.actor_id).hostname
        })
    }, [selectedUser])

    const handleSubmit = async (e: FormEvent) => {
        try {
            e.preventDefault();
            if(loading) return;
            setLoading(true);
            let usernameEle = (e.target as HTMLFormElement).elements[0] as any;
            let passwordEle = (e.target as HTMLFormElement).elements[1] as any; 
    
            let username: string = usernameEle.value;
            let password: string = passwordEle.value;

            // first check if jwt in session storage
            const sessionJwt = sessionStorage.getItem("jwt");
            const sessionInstance = sessionStorage.getItem("instance");
            const cookies = getCookies();
            const cookiesjwt = cookies.jwt;
            const cookiesinstance = cookies.instance;

            if (sessionJwt || cookiesjwt && (sessionInstance || cookiesinstance)) {
                setLoading(false);
                router.push("/");
                return;
            }
    
            // get jwt token
            const jwt = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password, instance: form.instance })
            }).then(res => res.json());

            console.log("JWT:", jwt);
            
            setCookies(jwt.jwt, form.instance);
            
            // get user details
            const user = await getUserDetails(jwt.jwt, form.instance);


            setSession({ ...session, jwt: jwt.jwt, user: user })
            
            // redirect to home
            setLoading(false);
            router.push("/");
    
        } catch (e: any) {
            setLoading(false);
            console.error(e.message);
        }
    }

    const getUserDetails = async (jwt: string, baseUrl: string) => {
        const user: GetSiteResponse = await fetch(`/api/getSite?auth=${jwt}&baseUrl=${baseUrl}`).then(res => res.json());
        return user as GetSiteResponse;
    }

    useEffect(() => {
        const timer = setTimeout(async () => {
            if(form.username.length > 0) await searchUsers(form.username);
        }, 250);

        return () => clearTimeout(timer);
    }, [form.username])

    const searchUsers = async (query: string) => {
        const data = await search({ q: query, type_: "Users", listing_type: "All" })
        console.log(data);
        if(!data) return;
        setUsers(data.users);

    }

    return (
        <div className="flex flex-col items-center justify-between h-96 pt-16 gap-24">
            {!inputFocus && <Logo />}

            <div className="flex items-center flex-col gap-4">
                {!inputFocus && <h1 className="font-bold text-3xl">Welcome back</h1>}

                <form onSubmit={(e) => handleSubmit(e)} className={`${styles.loginWrapper}`}>
                    <div className={`${styles.inputWrapper}`}>
                        <label htmlFor="">Username</label>
                        <input value={form.username} onChange={(e) => {setForm({...form, username: e.currentTarget.value}); setSelectedUser(null)}} required type="text" disabled={loading} className={`${loginError ? styles.inputError : styles.input}`} />

                        {users?.length > 0 && !selectedUser &&
                        <div className="absolute bg-neutral-100/75 dark:bg-neutral-900/90 backdrop-blur-3xl p-4 flex flex-col gap-4 rounded-lg left-0 translate-y-full z-50 w-full border border-neutral-300 dark:border-neutral-700" style={{ bottom: "-10%" }}>
                            {users.map((user, i) => (
                                <div onClick={() => setSelectedUser(user)} key={i} className="flex flex-row gap-2 items-center">
                                    <img src={user.person.avatar || DEFAULT_AVATAR} className="w-10 h-10 rounded-full overflow-hidden object-contain" alt="" />
                                    <div className="flex flex-col">
                                        <span className="font-bold">{user.person.display_name || user.person.name}</span>
                                        <span className="text-xs dark:text-neutral-300">@{new URL(user.person.actor_id).hostname}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        }

                    </div>
                    <div className={`${styles.inputWrapper}`}>
                        <label htmlFor="">Password</label>
                        <input value={form.password} onChange={(e) => setForm({...form, password:e.currentTarget.value})} required type="password" disabled={loading} className={`${loginError ? styles.inputError : styles.input}`}  />
                    </div>

                    <div className={`${styles.inputWrapper}`}>
                        <label htmlFor="">Instance</label>
                        <input value={form.instance} onChange={(e) => setForm({...form, instance:e.currentTarget.value})} required type="text" disabled={loading} className={`${loginError ? styles.inputError : styles.input}`}  />
                    </div>


                    <button disabled={loading} className={`${styles.button} ${styles.primary}`} type="submit">{loading ? <ClipLoader color={"#e6b0fa"} size={20} />: "Login"}</button>
                    <Link className="a" href="/auth/signup">Or sign up</Link>
                </form>
                
            </div>

        </div>
    )
}