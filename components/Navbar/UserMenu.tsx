"use client";
import Link from "next/link";
import Marquee from "react-fast-marquee";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/scrollbar";
import { motion } from "framer-motion";

import { DEFAULT_AVATAR } from "@/constants/settings";
import { useSession } from "@/hooks/auth";

import styles from "@/styles/components/Navbar/UserMenu.module.css";
import {
  Account,
  switchToAccount,
  sortCurrentAccount,
} from "@/utils/authFunctions";
import { useEffect } from "react";

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
        <div className=" cursor-not-allowed text-neutral-700 dark:text-neutral-400">
          <button className="cursor-not-allowed">
            <span className="material-symbols-outlined">{icon}</span>
            {text}
          </button>
        </div>
      </>
    );
  } else {
    return (
      <>
        <Link onClick={() => close()} href={link}>
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
  handleLogout,
  unreadCount,
  router,
}: {
  handleUserMenuClose: any;
  handleLogout: any;
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
        className={`${styles.userMenu}`}
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
                  className={`${styles.userProfile} ${
                    account.username == session.currentAccount?.username &&
                    styles.userProfileActive
                  } cursor-pointer`}
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
                  <div className={`${styles.userProfileText}`}>
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
                                  p-6 transition-all duration-100 ease-in-out hover:border-fuchsia-700"
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
            {session.isLoggedIn ? (
              <Link onClick={() => handleClose()} href={"/inbox"}>
                <button className="relative">
                  <div className="relative flex h-full w-fit items-center justify-center">
                    {unreadCount > 0 && (
                      <span className=" absolute left-1/3 top-0 m-2 rounded-full bg-red-400 px-1 text-xs font-bold text-red-950">
                        {unreadCount}
                      </span>
                    )}
                    <span className="material-symbols-outlined">
                      notifications
                    </span>
                  </div>
                  Notifications
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
              text="My Profile"
              icon="account_circle"
              link={`/u/${session.currentAccount?.user?.person?.name}@${session.currentAccount?.instance}`}
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
          <button onClick={() => handleClose()}>
            <span className="material-symbols-outlined">close</span>Close
          </button>

          <UserMenuItem
            text="Settings"
            icon="settings"
            link="/settings"
            close={handleClose}
          />

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
        </div>
      </motion.div>
    </>
  );
}
