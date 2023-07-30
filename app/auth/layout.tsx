"use client";
import { useNavbar } from "@/hooks/navbar";
import { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className=" min-h-screen w-full">{children}</div>;
}
