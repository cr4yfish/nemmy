"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import { Person } from "lemmy-js-client";
import SmallUser from "./SmallUser";
import { DEFAULT_AVATAR } from "@/constants/settings";

import styles from "../../styles/User/Username.module.css";

export default function Username({
  user,
  baseUrl,
  opensToTop = false,
}: {
  user: Person;
  baseUrl: string;
  opensToTop?: boolean;
}) {
  const [userHover, setUserHover] = useState<boolean>(false);

  return (
    <>
      {user ? (
        <div
          className={`${styles.wrapper}`}
          onMouseOver={() => setUserHover(true)}
          onMouseOut={() => setUserHover(false)}
          onClick={() => setUserHover(true)}
        >
          <div className={`${styles.hovercatcher}`}></div>
          <span>
            <Image
              className={`${styles.userimage} ${
                user.avatar ? "" : "p-1/2 object-contain"
              } `}
              style={{ height: "20px", width: "20px" }}
              src={user.avatar || DEFAULT_AVATAR}
              alt={user.name}
              height={20}
              width={20}
            />
          </span>
          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-400">
            {user.name}
          </span>
          <SmallUser
            user={user}
            userHover={userHover}
            setUserHover={setUserHover}
            baseUrl={baseUrl}
            opensToTop={opensToTop}
            style={{ position: "absolute", top: "100%", left: "0" }}
          />
        </div>
      ) : (
        <span>Loading...</span>
      )}
    </>
  );
}
