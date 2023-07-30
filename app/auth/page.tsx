"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import { useNavbar } from "@/hooks/navbar";
import { useEffect } from "react";
import { motion } from "framer-motion";

import styles from "@/styles/Pages/AuthPage.module.css";

export default function Auth() {
  const { navbar, setNavbar } = useNavbar();

  useEffect(() => {
    setNavbar({ ...navbar!, hidden: true });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex h-96 flex-col items-center justify-between gap-24 pt-16"
    >
      <Logo />

      <div className="flex flex-col items-center gap-12">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black">Like Reddit</h1>
          <span className="font-light">But u/spez isn&apos;t allowed</span>
        </div>

        <div className="flex w-full flex-col items-center gap-3">
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
  );
}
