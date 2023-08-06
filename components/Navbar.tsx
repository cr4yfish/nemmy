/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { ListingType, SortType } from "lemmy-js-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import va from "@vercel/analytics";

import { DEFAULT_INSTANCE, DEFAULT_AVATAR } from "@/constants/settings";

import { useSession } from "@/hooks/auth";
import { useNavbar, NavbarState } from "@/hooks/navbar";

import { getUnreadCount } from "@/utils/lemmy";

import UserMenu from "./Navbar/UserMenu";
import LeftSideMenu from "./Navbar/LeftSideMenu";
import SearchOverlay from "./Navbar/SearchOverlay";

import styles from "@/styles/Navbar.module.css";
import { disablePageScroll, enablePageScroll } from "scroll-lock";
import { Badge } from "@nextui-org/react";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export default function Navbar() {
  const { session, setSession } = useSession();
  const { navbar, setNavbar } = useNavbar();

  const [filterClicked, setFilterClicked] = useState(false);
  const [sortOptions, setSortOptions] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const [menu, setMenu] = useState(false);

  const [searchOverlay, setSearchOverlay] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);

  const router = useRouter();

  useEffect(() => {
    if (session.pendingAuth || !session?.currentAccount) return;
    getUnreadCount(
      { auth: session.currentAccount.jwt },
      session.currentAccount?.instance,
    ).then((data) => {
      if (!data) return;
      const total = data.replies + data.mentions;
      setUnreadCount(total);
    });
  }, [session.pendingAuth, session.currentAccount]);

  const handleFilterOverlayClose = async () => {
    navbar && setNavbar({ ...navbar, overlayActive: false });
    await delay(100);
    setFilterClicked(false);
    enablePageScroll();
    setSortOptions(false);
  };

  const handleUserMenuClose = async () => {
    navbar && setNavbar({ ...navbar, overlayActive: false });
    await delay(100);
    enablePageScroll();
    setUserMenu(false);
  };

  const handleUserMenuOpen = async () => {
    va.track("user-menu-open", {
      instance: session?.currentAccount?.instance || DEFAULT_INSTANCE,
    });
    handleFilterOverlayClose();
    disablePageScroll();
    setUserMenu(true);
  };

  const handleMenuOpen = async () => {
    va.track("menu-open", {
      instance: session?.currentAccount?.instance || DEFAULT_INSTANCE,
    });
    handleFilterOverlayClose();
    disablePageScroll();
    setMenu(true);
  };

  const handleMenuClose = async () => {
    navbar && setNavbar({ ...navbar, overlayActive: false });
    await delay(100);
    enablePageScroll();
    setMenu(false);
  };

  const handleCloseSearchOverlay = async () => {
    enablePageScroll();
    setSearchOverlay(false);
  };

  if (navbar?.hidden) return null;

  return (
    <>
      <nav
        className={`
          ${styles.wrapper} 
          border-neutral-200  bg-neutral-50/25 dark:border-neutral-800 dark:bg-neutral-950/25
          ${navbar?.hidden && "hidden"} 
        `}
      >
        <div className="flex flex-row items-center gap-6">
          <Link href="/" className={styles.logo}>
            Nemmy
          </Link>

          <div className="flex flex-row items-center gap-4">
            {navbar?.showMenu && (
              <button
                onClick={() => handleMenuOpen()}
                className={`${styles.menuButton} text-neutral-800 dark:text-neutral-100`}
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
            )}

            {navbar?.showback && (
              <div className={`${styles.backButton}`}>
                <button
                  className="flex items-center gap-2"
                  onClick={() => router.back()}
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
              </div>
            )}

            {navbar?.titleOverride && navbar?.titleOverride?.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">
                  {navbar?.icon}
                </span>
                <span className="font-bold">{navbar?.titleOverride}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-row items-center gap-4">
          {navbar?.showSearch && (
            <button
              className="flex items-center justify-center text-neutral-900 dark:text-neutral-100"
              onClick={() => {
                setSearchOverlay(true);
                va.track("search-open", {
                  instance:
                    session?.currentAccount?.instance || DEFAULT_INSTANCE,
                });
              }}
            >
              <span className="material-symbols-outlined">search</span>
            </button>
          )}

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
                        session?.currentAccount?.instance || DEFAULT_INSTANCE,
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

          {navbar?.showUser && (
            <>
              <button
                onClick={() => {
                  handleFilterOverlayClose();
                  handleUserMenuOpen();
                  setNavbar({ ...navbar, overlayActive: true });
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
            </>
          )}
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
            handleUserMenuClose={handleUserMenuClose}
            unreadCount={unreadCount}
            router={router}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <div
        onMouseUp={() => {
          handleUserMenuClose();
          handleMenuClose();
        }}
        onTouchEnd={() => {
          handleUserMenuClose();
          handleMenuClose();
        }}
        className={`${
          styles.overlay
        } z-50 bg-neutral-200/50 dark:bg-neutral-900/75 ${
          (userMenu || menu) && styles.overlayActive
        }`}
      ></div>

      {/* Filter Overlay */}
      <div
        onTouchEnd={() => handleFilterOverlayClose()}
        onMouseUp={() => handleFilterOverlayClose()}
        className={`${
          styles.overlay
        } z-10 bg-neutral-200/50 dark:bg-neutral-900/75 ${
          (filterClicked || sortOptions) && styles.overlayActive
        }`}
      ></div>
    </>
  );
}
