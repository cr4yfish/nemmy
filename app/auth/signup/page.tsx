"use client" 

import { useState, useEffect, FormEvent } from "react"
import { useSession } from "@/hooks/auth"
import Logo from "@/components/Logo"
import { useRouter } from "next/navigation"

import styles from "@/styles/Pages/LoginPage.module.css"

export default function Register() {
    const [form, setForm] = useState<{ username: string, password: string, saveLogin: boolean}>({} as any)
    const { session, setSession } = useSession()
    const router = useRouter()

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        alert("Not implemented yet");
        
        // when done router.push("/")
    }

    return (
        <div className="flex flex-col items-center justify-between h-96 pt-16 gap-24">
            <Logo />

            <div className="flex items-center flex-col gap-4">
                <h1 className="font-bold text-3xl">Welcome to Nemmy</h1>

                <form onSubmit={(e) => handleSubmit(e)} className={`${styles.loginWrapper}`}>
                    <div className={`${styles.inputWrapper}`}>
                        <label htmlFor="username">Username</label>
                        <input type="text" id="username" name="username" required />
                    </div>
                    <div className={`${styles.inputWrapper}`}>
                        <label htmlFor="">Email</label>
                        <input required type="email" />
                    </div>
                    <div className={`${styles.inputWrapper}`}>
                        <label htmlFor="">Password</label>
                        <input required type="password" />
                    </div>
                    <div onClick={() => setForm({...form, saveLogin: !form.saveLogin})}  className={`flex flex-row gap-3 items-center select-none cursor-pointer`}>
                        <input className="w-fit cursor-pointer" type="checkbox" id="saveLogin" checked={form.saveLogin} />
                        <label className="w-fit cursor-pointer" htmlFor="">Show NSFW Content</label>
                    </div>
                    <button className={`${styles.button} ${styles.primary}`} type="submit">Sign up</button>
                </form>
                
            </div>

        </div>
    )
}