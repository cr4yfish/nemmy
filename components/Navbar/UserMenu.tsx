"use client";
import Link from "next/link";
import Marquee from "react-fast-marquee";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/scrollbar";
import { motion } from "framer-motion";
import va from "@vercel/analytics";
import { useEffect } from "react";
import { Badge } from "@nextui-org/react";

import { DEFAULT_AVATAR, DEFAULT_INSTANCE } from "@/constants/settings";
import { useSession } from "@/hooks/auth";

import styles from "@/styles/components/Navbar/UserMenu.module.css";
import {
  Account,
  switchToAccount,
  sortCurrentAccount,
  handleLogout,
} from "@/utils/authFunctions";

function UserMenuItem({
  text,
  icon,
  link,
  close,
  disabled,
}: {
  text: string;
  icon: string;
  link: string;
  close: Function;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <>
        <a className=" cursor-not-allowed text-neutral-700 dark:text-neutral-400">
          <button className="cursor-not-allowed">
            <span className="material-symbols-outlined">{icon}</span>
            {text}
          </button>
        </a>
      </>
    );
  } else {
    return (
      <>
        <Link
          onClick={() => close()}
          href={link}
          className="hover:bg-neutral-200 dark:hover:bg-neutral-800"
        >
          <button>
            <span className="material-symbols-outlined">{icon}</span>
            {text}
          </button>
        </Link>
      </>
    );
  }
}

export default function UserMenu({
  handleUserMenuClose,
  unreadCount,
  router,
}: {
  handleUserMenuClose: any;
  unreadCount: any;
  router: any;
}) {
  const { session, setSession } = useSession();

  // Only sort accounts on first render
  // So they dont get switched around when switching accounts
  useEffect(() => {
    sortCurrentAccount(session, setSession);
  }, []);

  const handleSwitchAccount = (account: Account) => {
    switchToAccount(account, setSession, session);
  };

  const handleClose = () => {
    sortCurrentAccount(session, setSession);
    handleUserMenuClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0, transition: { bounce: 0 } }}
        exit={{ opacity: 0, x: 300 }}
        id="usermenu"
        className={`${styles.userMenu} bg-neutral-50/75 dark:bg-neutral-950/75`}
      >
        <div className={`flex h-full w-full flex-col gap-4`}>
          {
            <Swiper
              modules={[Mousewheel, Scrollbar]}
              className="h-52 w-full"
              spaceBetween={50}
              slidesPerView={1}
              mousewheel={{
                forceToAxis: true,
                releaseOnEdges: true,
              }}
              scrollbar={{
                draggable: true,
              }}
            >
              {session.accounts.map((account, index) => (
                <SwiperSlide
                  onClick={() => handleSwitchAccount(account)}
                  key={index}
                  className={`${styles.userProfile} cursor-pointer
                    ${
                      account.username == session.currentAccount?.username &&
                      styles.userProfileActive
                    } 
                  `}
                >
                  <Image
                    width={100}
                    height={50}
                    className={`${styles.userProfileBanner}`}
                    src={account?.user?.person.banner || ""}
                    alt=""
                  />
                  <div className={`${styles.userProfileBannerOverlay}`}></div>
                  <Image
                    width={40}
                    height={40}
                    className={`${styles.userProfileAvatar}`}
                    src={account.user?.person?.avatar || DEFAULT_AVATAR}
                    alt=""
                  />
                  <div className={`${styles.userProfileText} text-neutral-50`}>
                    <span className={`${styles.userProfileUsername} text-xs`}>
                      {account.instance}
                    </span>
                    {account.username.length > 30 ? (
                      <Marquee>
                        <span
                          className={`${styles.userProfileDisplayName} text-sm`}
                        >
                          u/{account.username}
                        </span>
                      </Marquee>
                    ) : (
                      <span
                        className={`${styles.userProfileDisplayName} text-sm`}
                      >
                        u/{account.username}
                      </span>
                    )}
                  </div>
                </SwiperSlide>
              ))}

              <SwiperSlide className="flex h-48 w-12 items-center justify-center px-6">
                <Link href={"/auth"}>
                  <button
                    onClick={() => handleClose()}
                    className="flex h-full w-full flex-col items-center justify-center gap-2
                                  rounded-lg border-2 border-transparent bg-fuchsia-200 
                                  p-6 duration-100 ease-in-out transition-all hover:border-fuchsia-700"
                  >
                    <span className="material-symbols-outlined text-fuchsia-700">
                      add
                    </span>
                    <span className=" font-medium text-fuchsia-700">
                      Add an Account
                    </span>
                  </button>
                </Link>
              </SwiperSlide>
            </Swiper>
          }

          {!session.isLoggedIn && (
            <span>
              <Link href={"/auth"} className="a">
                Log in
              </Link>{" "}
              for more features.
            </span>
          )}

          <div className={`${styles.userMenuInteractionsTop}`}>
            <UserMenuItem
              text="My Profile"
              icon="account_circle"
              link={`/u/${session.currentAccount?.user?.person?.name}@${session.currentAccount?.instance}`}
              close={handleClose}
              disabled={!session.isLoggedIn}
            />

            {session.isLoggedIn ? (
              <Link
                href="/inbox"
                className="h-fit max-h-min hover:bg-neutral-200 dark:hover:bg-neutral-800"
              >
                <button
                  className="flex items-center justify-center text-neutral-900 dark:text-neutral-100"
                  onClick={() => {
                    va.track("click-inbox", {
                      instance:
                        session?.currentAccount?.instance || DEFAULT_INSTANCE,
                    });
                  }}
                >
                  <Badge content={unreadCount}>
                    <span className="material-symbols-outlined">
                      notifications
                    </span>
                  </Badge>
                  <span>Inbox</span>
                </button>
              </Link>
            ) : (
              <UserMenuItem
                text="Notifications"
                icon="notifications"
                link="/inbox"
                close={handleClose}
                disabled
              />
            )}

            <UserMenuItem
              text="Bookmarks"
              icon="bookmark"
              link="/bookmarks"
              close={handleClose}
              disabled={!session.isLoggedIn}
            />

            <UserMenuItem
              text="Create a Post"
              icon="add_circle_outline"
              link="/post/new"
              close={handleClose}
              disabled={!session.isLoggedIn}
            />
            <UserMenuItem
              text="Create a Community"
              icon="group_add"
              link="/c/new"
              close={handleClose}
              disabled={!session.isLoggedIn}
            />
            <UserMenuItem
              text="Chat"
              icon="chat"
              link="/chat"
              close={handleClose}
              disabled={!session.isLoggedIn}
            />
          </div>
        </div>

        <div className={`${styles.userMenuInteractionsBottom}`}>
          <a className="hover:bg-neutral-200 dark:hover:bg-neutral-800">
            <button onClick={() => handleClose()}>
              <span className="material-symbols-outlined">close</span>Close
            </button>
          </a>

          <UserMenuItem
            text="Settings"
            icon="settings"
            link="/settings"
            disabled={!session.isLoggedIn}
            close={handleClose}
          />

          <a className="hover:bg-neutral-200 dark:hover:bg-neutral-800">
            <button
              onClick={() => {
                handleClose();
                handleLogout({
                  session: session,
                  setSession: setSession,
                  router: router,
                  account: session.currentAccount,
                });
              }}
            >
              <span className="material-symbols-outlined">logout</span>Log out
            </button>
          </a>
        </div>
      </motion.div>
    </>
  );
}
