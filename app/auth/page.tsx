"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import { motion } from "framer-motion";
import { Button } from "@nextui-org/react";

export default function Auth() {
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
            <Button
              startContent={
                <span className="material-symbols-outlined">login</span>
              }
              color="primary"
              className=" w-full"
            >
              Sign in
            </Button>
          </Link>
          <span className="font-light text-neutral-400">or</span>
          <Link className="w-full" href={"/auth/signup"}>
            <Button
              startContent={
                <span className="material-symbols-outlined">person_add</span>
              }
              className=" w-full"
              variant="bordered"
              color="primary"
            >
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
