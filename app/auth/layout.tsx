"use client"
import { useNavbar } from "@/hooks/navbar"
import { useEffect } from "react";

export default function Layout({
    children
} : { children: React.ReactNode}) {

    return (
        <div className=" w-full min-h-screen">
            {children}
        </div>
    )
}