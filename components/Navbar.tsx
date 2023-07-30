/* eslint-disable @next/next/no-img-element */
"use client";
import { FormEvent, useEffect, useState, useRef } from "react";
import {
  CommunityView,
  ListingType,
  PostView,
  Search,
  SearchResponse,
  SortType,
} from "lemmy-js-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";

import { DEFAULT_INSTANCE, DEFAULT_AVATAR } from "@/constants/settings";

import { useSession } from "@/hooks/auth";
import { useNavbar, NavbarState } from "@/hooks/navbar";

import { handleLogout } from "@/utils/authFunctions";
import {
  getTrendingCommunities,
  getTrendingTopics,
  getUnreadCount,
} from "@/utils/lemmy";

import UserMenu from "./Navbar/UserMenu";
import LeftSideMenu from "./Navbar/LeftSideMenu";
import SearchOverlay from "./Navbar/SearchOverlay";

import styles from "@/styles/Navbar.module.css";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

function SortButton({
  option,
  label,
  navbar,
  setNavbar,
  icon = undefined,
  replaceIcon = undefined,
  setSortOptions,
  sortOptions,
}: {
  option: SortType;
  label: string;
  navbar?: NavbarState;
  setNavbar?: any;
  icon?: string;
  replaceIcon?: React.ReactNode;
  setSortOptions: Function;
  sortOptions: boolean;
}) {
  if (!option || !label || !navbar || !setNavbar) {
    console.error(
      "SortButton: option or label not provided",
      option,
      label,
      icon,
      replaceIcon,
    );
    return null;
  }

  const handleFilterOverlayClose = async () => {
    navbar &&
      setNavbar({ ...navbar, overlayActive: false, currentSort: option });
    await delay(100);
    setSortOptions(false);
  };

  return (
    <>
      <button
        onClick={() => {
          handleFilterOverlayClose();
        }}
        className={`${
          sortOptions &&
          navbar?.currentSort == option &&
          styles.activeFilterOption
        }`}
      >
        {icon && <span className={`material-symbols-outlined`}>{icon}</span>}
        {replaceIcon}
        {label}
      </button>
    </>
  );
}

function FilterButton({
  label,
  option,
  icon,
  navbar,
  setNavbar,
  setFilterClicked,
  filterClicked,
}: {
  label: string;
  option: ListingType;
  icon: string;
  navbar?: NavbarState;
  setNavbar?: any;
  setFilterClicked: Function;
  filterClicked: boolean;
}) {
  const { session } = useSession();
  const router = useRouter();

  const handleFilterOverlayClose = async () => {
    if (option == "Subscribed") {
      if (!session?.currentAccount?.user?.person.id) {
        navbar && setNavbar({ ...navbar, overlayActive: false });
        setFilterClicked(false);
        router.push("/auth");
        return;
      }
    }

    navbar &&
      setNavbar({ ...navbar, overlayActive: false, currentType: option });
    await delay(100);
    setFilterClicked(false);
  };

  return (
    <>
      <button
        onClick={() => handleFilterOverlayClose()}
        className={`${
          filterClicked &&
          navbar?.currentType == option &&
          styles.activeFilterOption
        }`}
      >
        <span className="material-symbols-outlined">{icon}</span>
        {label}
      </button>
    </>
  );
}

async function search({ searchParams }: { searchParams: Search }) {
  // add a signature to the object to make typescript happy
  const params: { [index: string]: any } = {
    ...searchParams,
  };

  // filter out undefined values
  Object.keys(params).forEach(
    (key) => params[key] === undefined && delete params[key],
  );

  const query = Object.keys(params)
    .map((key) => key + "=" + params[key])
    .join("&");
  const requestUrl = `/api/search?${query}`;

  const response = await fetch(requestUrl);

  const data = await response.json();
  return data;
}

export default function Navbar() {
  const { session, setSession } = useSession();
  const { navbar, setNavbar } = useNavbar();
  const [isSearching, setIsSearching] = useState(false);
  const [filterClicked, setFilterClicked] = useState(false);
  const [sortOptions, setSortOptions] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const [menu, setMenu] = useState(false);
  const [communitySearch, setCommunitySearch] = useState<string>("");

  const [searchOverlay, setSearchOverlay] = useState(false);
  const [currentSearch, setCurrentSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResponse>(
    {} as SearchResponse,
  );
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [trendingCommunities, setTrendingCommunities] = useState<
    CommunityView[]
  >([]);
  const [trendingTopics, setTrendingTopics] = useState<PostView[]>([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const router = useRouter();

  // Update input value when user stops typing
  useEffect(() => {
    if (currentSearch?.length == 0) return;
    const timer = setTimeout(async () => {
      if (currentSearch.length == 0) return;
      if (currentSearch.length < 2)
        return alert("Search term must be at least 2 characters long");
      setSearchLoading(true);
      const data = await search({
        searchParams: {
          q: currentSearch,
        },
      });
      setIsSearching(true);
      setSearchResults(data);
      setSearchLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentSearch]);

  useEffect(() => {
    if (!searchOverlay) return;
    getTrendingCommunities(session.currentAccount?.instance).then((data) => {
      if (typeof data === "boolean") return;
      setTrendingCommunities(data);
    });
    getTrendingTopics().then((data) => {
      if (typeof data === "boolean") return;
      setTrendingTopics(data);
    });
  }, [searchOverlay]);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchLoading(true);
    const resp = await search({
      searchParams: {
        q: currentSearch,
        community_id: undefined,
        community_name: undefined,
        creator_id: undefined,
        type_: "Posts",
        sort: undefined,
        listing_type: undefined,
        page: undefined,
        limit: undefined,
        auth: session?.currentAccount?.jwt || undefined,
      },
    });
    setSearchLoading(false);
    setSearchResults(resp);
  };

  const handleFilterOverlayClose = async () => {
    navbar && setNavbar({ ...navbar, overlayActive: false });
    await delay(100);
    setFilterClicked(false);
    setSortOptions(false);
  };

  const handleUserMenuClose = async () => {
    navbar && setNavbar({ ...navbar, overlayActive: false });
    await delay(100);
    setUserMenu(false);
  };

  const handleUserMenuOpen = async () => {
    handleFilterOverlayClose();
    setUserMenu(true);
  };

  const handleMenuOpen = async () => {
    handleFilterOverlayClose();
    setMenu(true);
  };

  const handleMenuClose = async () => {
    navbar && setNavbar({ ...navbar, overlayActive: false });
    await delay(100);
    setMenu(false);
  };

  const handleCloseSearchOverlay = async () => {
    setCurrentSearch("");
    setIsSearching(false);
    setSearchOverlay(false);
  };

  if (navbar?.hidden) return null;

  return (
    <>
      <nav className={`${styles.wrapper} ${navbar?.hidden && "hidden"}`}>
        <div className="flex flex-row items-center gap-6">
          <Link href="/" className={styles.logo}>
            Nemmy
          </Link>

          <div className="flex flex-row items-center gap-4">
            {navbar?.showMenu && (
              <button
                onClick={() => handleMenuOpen()}
                className={`${styles.menuButton}`}
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
                  Back
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

            {navbar?.showFilter && (
              <button
                className={`${styles.navButton}`}
                onClick={() => {
                  setFilterClicked(!filterClicked);
                  setSortOptions(false);
                  handleUserMenuClose();
                  setNavbar({ ...navbar, overlayActive: !filterClicked });
                }}
              >
                <div>
                  <span className="material-symbols-outlined">filter_list</span>
                  <span className={`${styles.navButtonText}`}>
                    {navbar?.currentType}
                  </span>
                </div>
                <span className="material-symbols-outlined">
                  arrow_drop_down
                </span>
              </button>
            )}

            {navbar?.showSort && (
              <button
                className={`${styles.navButton}`}
                onClick={() => {
                  setSortOptions(!sortOptions);
                  handleUserMenuClose();
                  handleMenuClose();
                  setFilterClicked(false);
                  setNavbar({ ...navbar, overlayActive: !sortOptions });
                }}
              >
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined">sort</span>
                  <span className={`${styles.navButtonText}`}>
                    {navbar?.currentSort}
                  </span>
                </div>
                <span className="material-symbols-outlined">
                  arrow_drop_down
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-row items-center gap-4">
          {navbar?.showSearch && (
            <button
              className="flex items-center justify-center"
              onClick={() => {
                setSearchOverlay(true);
                searchInputRef?.current?.focus();
              }}
            >
              <span className="material-symbols-outlined">search</span>
            </button>
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
          <SearchOverlay
            handleCloseSearchOverlay={handleCloseSearchOverlay}
            searchInputRef={searchInputRef}
            handleSubmit={handleSubmit}
            searchLoading={searchLoading}
            currentSearch={currentSearch}
            setCurrentSearch={setCurrentSearch}
            isSearching={isSearching}
            trendingTopics={trendingTopics}
            trendingCommunities={trendingCommunities}
            searchResults={searchResults}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menu && (
          <LeftSideMenu
            handleMenuClose={handleMenuClose}
            setCommunitySearch={setCommunitySearch}
            communitySearch={communitySearch}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {userMenu && (
          <UserMenu
            handleUserMenuClose={handleUserMenuClose}
            handleLogout={handleLogout}
            unreadCount={unreadCount}
            router={router}
          />
        )}
      </AnimatePresence>

      {/* Filter Options */}
      <div
        className={`${styles.filterOptions} ${
          filterClicked && styles.filterActive
        }`}
      >
        <FilterButton
          label="All"
          option="All"
          icon="public"
          navbar={navbar}
          setNavbar={setNavbar}
          setFilterClicked={setFilterClicked}
          filterClicked={filterClicked}
        />
        <FilterButton
          label="Local"
          option="Local"
          icon="location_on"
          navbar={navbar}
          setNavbar={setNavbar}
          setFilterClicked={setFilterClicked}
          filterClicked={filterClicked}
        />
        <FilterButton
          label="Subscribed"
          option="Subscribed"
          icon="communities"
          navbar={navbar}
          setNavbar={setNavbar}
          setFilterClicked={setFilterClicked}
          filterClicked={filterClicked}
        />
      </div>

      {/* Sort Options */}
      <div
        className={`${styles.sortOptions} ${
          sortOptions && styles.sortOptionsActive
        }`}
      >
        <SortButton
          label="Active"
          option="Active"
          navbar={navbar}
          setNavbar={setNavbar}
          replaceIcon={<span className="active m-2"></span>}
          setSortOptions={setSortOptions}
          sortOptions={sortOptions}
        />
        <SortButton
          label="Hot"
          option="Hot"
          icon="whatshot"
          navbar={navbar}
          setNavbar={setNavbar}
          setSortOptions={setSortOptions}
          sortOptions={sortOptions}
        />
        <SortButton
          label="New"
          option="New"
          icon="history"
          navbar={navbar}
          setNavbar={setNavbar}
          setSortOptions={setSortOptions}
          sortOptions={sortOptions}
        />
        <SortButton
          label="Most Comments"
          option="MostComments"
          icon="arrows_more_up"
          navbar={navbar}
          setNavbar={setNavbar}
          setSortOptions={setSortOptions}
          sortOptions={sortOptions}
        />
      </div>

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
        className={`${styles.overlay} z-50 ${
          (userMenu || menu) && styles.overlayActive
        }`}
      ></div>

      {/* Filter Overlay */}
      <div
        onTouchEnd={() => handleFilterOverlayClose()}
        onMouseUp={() => handleFilterOverlayClose()}
        className={`${styles.overlay} z-10 ${
          (filterClicked || sortOptions) && styles.overlayActive
        }`}
      ></div>
    </>
  );
}
