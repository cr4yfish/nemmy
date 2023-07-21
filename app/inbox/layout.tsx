"use client"

import { useEffect } from "react";
import { useNavbar } from "@/hooks/navbar"

export default function Layout({
    children 
} : { children: React.ReactNode}) {

    const { navbar, setNavbar } = useNavbar();

    useEffect(() => {
        setNavbar({ ...navbar!, 
            showSort: false, showFilter: false, 
            showSearch: false, showback: false, 
            hidden: false,
            titleOverride: "Inbox", icon: "Notifications",
            showUser: true
        })
    }, [])

    return (
        <div className="mt-24 min-h-screen w-full flex flex-col, justify-center py-4 mb-6">
            {children}
        </div>
    )
}