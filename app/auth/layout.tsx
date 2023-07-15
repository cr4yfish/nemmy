"use client"
import { useNavbar } from "@/hooks/navbar"
import { useEffect } from "react";

export default function Layout({
    children
} : { children: React.ReactNode}) {
    const { navbar, setNavbar } = useNavbar();

    useEffect(() => {
        if(navbar?.hidden) return;
        setNavbar({ ...navbar!, hidden: true })
    }, [navbar])

    return (
        <div className=" w-full min-h-screen">
            {children}
        </div>
    )
}