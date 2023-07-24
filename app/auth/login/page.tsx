"use client"

import { GetSiteResponse, PersonView } from "lemmy-js-client"
import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import Link from "next/link";
import { motion } from "framer-motion";
import { ClipLoader } from "react-spinners";

import { useSession } from "@/hooks/auth";

import Logo from "@/components/Logo";

import { search, getUserDetails } from "@/utils/lemmy";
import { saveAccount, getAccounts, handleLogin, Account, AccountWithSiteResponse } from "@/utils/authFunctions";

import { DEFAULT_AVATAR } from "@/constants/settings";

import styles from "@/styles/Pages/LoginPage.module.css";
import Image from "next/image";


export default function Login() {
    const { session, setSession } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [inputFocus, setInputFocus] = useState<boolean>(false);
    const [users, setUsers] = useState<PersonView[]>([]);
    const [selectedUser, setSelectedUser] = useState<PersonView | null>(null);
    const [loginError, setLoginError] = useState<boolean>(false);

    const [searchingUserLoading, setSearchingUserLoading] = useState<boolean>(false);

    const [form, setForm] = useState<{ username: string, password: string, saveLogin: boolean, instance: string}>({
        username: "",
        password: "",
        saveLogin: false,
        instance: "",
    })

    useEffect(() => {
        if(!selectedUser?.person.name) return;
        setForm(prevState => {
            return {
                ...prevState,
                username: selectedUser.person.name,
                instance: new URL(selectedUser.person.actor_id).hostname
            }
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

            const accounts = getAccounts();
            // check if there's an account with the same username and instance
            const hasAccount = accounts.find(account => account.username == username && account.instance == form.instance);

            // if there's any pair of jwt and session, redirect to home since user is already logged in
            if (hasAccount) {
                setLoading(false);
                alert("You already have this account saved");
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
            
            // get user details
            const user = await getUserDetails(jwt.jwt, form.instance);

            if(!user.my_user) throw new Error("User not found");

            const accountWithSite: AccountWithSiteResponse = {
                username: form.username,
                instance: form.instance,
                jwt: jwt.jwt,
                user: user.my_user.local_user_view,
                site: user,
            }

            await handleLogin({
                accountWithSite: accountWithSite,
                session: session,
                setSession: setSession,
                router: router,
            });
    
        } catch (e: any) {
            setLoading(false);
            setLoginError(true);
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
        setSearchingUserLoading(true);
        const data = await search({ q: query, type_: "Users", listing_type: "All" })
        if(!data) return;
        setUsers(data.users);
        setSearchingUserLoading(false);
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col items-center justify-between h-96 pt-16 gap-24"
        >
            {!inputFocus && <Logo />}

            <div className="flex items-center flex-col gap-4">
                {!inputFocus && <h1 className="font-bold text-3xl">Welcome back</h1>}

                <form onSubmit={(e) => handleSubmit(e)} className={`${styles.loginWrapper}`}>
                    <div className={`${styles.inputWrapper}`}>
                        <label htmlFor="">Username</label>

                        <div className={`${loginError ? styles.inputError : styles.input} overflow-hidden rounded-lg relative`}>
                            <input 
                                value={form.username} 
                                onChange={(e) => {setForm({...form, username: e.currentTarget.value}); setSelectedUser(null)}} 
                                required type="text" disabled={loading} className={`bg-transparent w-full h-full outline-none`}
                            />
                            <div className="absolute right-0 top-0 h-full flex justify-center items-center pr-2">
                                <ClipLoader color={"#e6b0fa"} size={20} loading={searchingUserLoading} className="" />
                            </div>
                            
                        </div>


                        {users?.length > 0 && !selectedUser &&
                        <div className="absolute bg-neutral-100/75 dark:bg-neutral-900/90 backdrop-blur-3xl p-4 flex flex-col gap-4 rounded-lg left-0 translate-y-full z-50 w-full border border-neutral-300 dark:border-neutral-700" style={{ bottom: "-10%" }}>
                            {users.map((user, i) => (
                                <div onClick={() => setSelectedUser(user)} key={i} className="flex flex-row gap-3 items-center cursor-pointer dark:pb-4 dark:border-b border-neutral-700">
                                    <Image height={40} width={40} src={user.person.avatar || DEFAULT_AVATAR} className="w-10 h-10 rounded-full overflow-hidden object-contain" alt="" />
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

        </motion.div>
    )
}