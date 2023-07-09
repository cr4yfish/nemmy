"use client";

import PostList from "@/components/PostList"
import Navbar from "@/components/Navbar"
import { useNavbar } from "@/hooks/navbar"
import { useEffect } from "react";

export default function Home() {
  const { navbar, setNavbar } = useNavbar();

  useEffect(() => {
    setNavbar({ ...navbar!, showMenu: true, showSort: true, showFilter: true, showSearch: true, showUser: true, showback: false, hidden: false })
  }, [])

  return (
    <div id="postpage" className={`flex min-h-screen flex-col items-center mt-4`}>

      <PostList />
      
    </div>
  )
}
