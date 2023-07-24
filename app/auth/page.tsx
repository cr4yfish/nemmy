"use client"

import Link from "next/link"
import Logo from "@/components/Logo"
import { useNavbar } from "@/hooks/navbar"
import { useEffect } from "react"
import { motion } from "framer-motion"

import styles from "@/styles/Pages/AuthPage.module.css"

export default function Auth() {
    const { navbar, setNavbar } = useNavbar();

    useEffect(() => {
        setNavbar({ ...navbar!, hidden: true })
    }, [])

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col items-center justify-between h-96 pt-16 gap-24"
        >
            <Logo />

            <div className="flex flex-col gap-12 items-center">
                <div className="flex flex-col gap-1">
                    <h1 className="font-black text-3xl">Like Reddit</h1>
                    <span className="font-light">But u/spez isn&apos;t allowed</span>
                </div>
                
                <div className="flex flex-col gap-3 items-center w-full">
                    <Link className="w-full" href={"/auth/login"}>
                        <button className={`${styles.button} ${styles.primary}`}>
                            <span className="material-icons-outlined">email</span>
                            Sign in
                        </button>
                    </Link>
                    <span className="font-light text-neutral-400">or</span>
                    <Link className="w-full" href={"/auth/signup"}>
                        <button className={`${styles.button} ${styles.secondary}`}>
                            Sign up
                        </button>
                    </Link>
                </div>
            </div>

            
            
        </motion.div>
    )
}