"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import va from "@vercel/analytics";
import { Badge } from "@nextui-org/react";
import { disablePageScroll, enablePageScroll } from "scroll-lock";

import { DEFAULT_INSTANCE, DEFAULT_AVATAR } from "@/constants/settings";

import { useSession } from "@/hooks/auth";
import { NavbarState } from "@/hooks/navbar";

import { getUnreadCount } from "@/utils/lemmy";

import UserMenu from "./Navbar/UserMenu";
import LeftSideMenu from "./Navbar/LeftSideMenu";
import SearchOverlay from "./Navbar/SearchOverlay";

import styles from "@/styles/Navbar.module.css";

export default function Navbar({ params }: { params?: NavbarState }) {
  const { session } = useSession();

  const [filterClicked, setFilterClicked] = useState(false);
  const [sortOptions, setSortOptions] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const [menu, setMenu] = useState(false);

  const [searchOverlay, setSearchOverlay] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);

  const router = useRouter();

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  useEffect(() => {
    if (session.pendingAuth || !session?.currentAccount || !session.isLoggedIn)
      return;
    getUnreadCount(
      { auth: session.currentAccount.instanceAccounts[0]?.jwt || "" },
      session.currentAccount?.instanceAccounts[0]?.instance,
    ).then((data) => {
      if (!data) return;
      const total = data.replies + data.mentions;
      setUnreadCount(total);
    });
  }, [session.pendingAuth, session.currentAccount]);

  const handleMenuClose = async () => {
    await delay(200);
    setUserMenu(false);
    setMenu(false);
    enablePageScroll();
  };

  const handleUserMenuOpen = async () => {
    va.track("user-menu-open", {
      instance:
        session?.currentAccount?.instanceAccounts[0]?.instance ||
        DEFAULT_INSTANCE,
    });
    disablePageScroll();
    setUserMenu(true);
  };

  const handleMenuOpen = async () => {
    va.track("menu-open", {
      instance:
        session?.currentAccount?.instanceAccounts[0]?.instance ||
        DEFAULT_INSTANCE,
    });
    disablePageScroll();
    setMenu(true);
  };

  const handleCloseSearchOverlay = async () => {
    enablePageScroll();
    setSearchOverlay(false);
  };

  if (params?.hidden) return null;

  return (
    <>
      <nav
        className={`
          ${styles.wrapper} 
          border-neutral-200  bg-neutral-50/25 dark:border-neutral-800 dark:bg-neutral-950/25
        `}
      >
        <div className="flex flex-row items-center gap-6">
          <Link href="/" className={`${styles.logo} max-sm:hidden`}>
            Nemmy
          </Link>

          <Link href={"/"} className={`${styles.logo} hidden max-sm:block`}>
            N
          </Link>

          <div className="flex flex-row items-center gap-4">
            <button
              onClick={() => handleMenuOpen()}
              className={`${styles.menuButton} text-neutral-800 dark:text-neutral-100`}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            {params?.titleOverride && params?.titleOverride?.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">
                  {params?.icon}
                </span>
                <span className="font-bold">{params?.titleOverride}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-row items-center gap-4">
          <button
            className="flex items-center justify-center text-neutral-900 dark:text-neutral-100"
            onClick={() => {
              setSearchOverlay(true);
              va.track("search-open", {
                instance:
                  session?.currentAccount?.instanceAccounts[0]?.instance ||
                  DEFAULT_INSTANCE,
              });
            }}
          >
            <span className="material-symbols-outlined">search</span>
          </button>

          {session.isLoggedIn && (
            <Link
              href="/inbox"
              className="h-fit max-h-min"
              style={{ transform: "translateY(10%)" }}
            >
              <Badge content={unreadCount > 0 ? unreadCount : ""}>
                <button
                  className="flex items-center justify-center text-neutral-900 dark:text-neutral-100"
                  onClick={() => {
                    va.track("click-inbox", {
                      instance:
                        session?.currentAccount?.instanceAccounts[0]
                          ?.instance || DEFAULT_INSTANCE,
                    });
                  }}
                >
                  <span className="material-symbols-outlined">
                    notifications
                  </span>
                </button>
              </Badge>
            </Link>
          )}

          <button
            onClick={() => {
              handleUserMenuOpen();
            }}
            className={`${styles.userWrapper} cursor-pointer select-none`}
          >
            <div className={styles.userImage}>
              <Image
                width={40}
                height={40}
                className={`h-10 w-10 overflow-hidden ${
                  session?.currentAccount?.user?.person?.avatar
                    ? "object-cover"
                    : "object-contain"
                } `}
                style={{ borderRadius: "50%" }}
                src={
                  session?.currentAccount?.user?.person?.avatar ||
                  DEFAULT_AVATAR
                }
                alt={"Account"}
              />
            </div>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {searchOverlay && (
          <SearchOverlay handleCloseSearchOverlay={handleCloseSearchOverlay} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menu && <LeftSideMenu handleMenuClose={handleMenuClose} />}
      </AnimatePresence>

      <AnimatePresence>
        {userMenu && (
          <UserMenu
            handleUserMenuClose={handleMenuClose}
            unreadCount={unreadCount}
            router={router}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <div
        onMouseUp={() => {
          handleMenuClose();
        }}
        onTouchEnd={() => {
          handleMenuClose();
        }}
        className={`${
          styles.overlay
        } z-50 bg-neutral-200/50 dark:bg-neutral-900/75 ${
          (userMenu || menu) && styles.overlayActive
        }`}
      ></div>
    </>
  );
}
