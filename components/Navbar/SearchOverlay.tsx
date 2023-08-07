"use client";
import Link from "next/link";
import { ClipLoader } from "react-spinners";
import {
  CommunityView,
  PostView,
  SearchResponse,
  Search,
} from "lemmy-js-client";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, FormEvent, useRef } from "react";
import { disablePageScroll, enablePageScroll } from "scroll-lock";
import { getTrendingCommunities, getTrendingTopics } from "@/utils/lemmy";
import InfiniteScroll from "react-infinite-scroller";
import { Tabs, Tab } from "@nextui-org/react";

import { useSession } from "@/hooks/auth";

import styles from "@/styles/components/Navbar/SearchOverlay.module.css";

import { DEFAULT_AVATAR } from "@/constants/settings";

import { FormatNumber } from "@/utils/helpers";

import Post from "../Post";
import Community from "../Community";
import EndlessScrollingEnd from "../ui/EndlessSrollingEnd";
import TabContent from "../ui/TabContent";
import UserCard from "../User/UserCard";

function TrendingCommunity({
  community,
  closeSearch,
}: {
  community: CommunityView;
  closeSearch: Function;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { bounce: 0.2 } }}
      exit={{ opacity: 0, y: 10 }}
      className=" w-full"
    >
      <Link
        href={`/c/${community?.community?.name}@${
          new URL(community?.community?.actor_id).host
        }`}
        onClick={() => closeSearch()}
        className=" flex w-full flex-row items-center justify-start gap-2 rounded-xl border border-neutral-500 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <Image
          width={48}
          height={48}
          className="h-12 w-12 rounded-full object-cover"
          src={community.community.icon || DEFAULT_AVATAR}
          alt=""
        />
        <div className="flex flex-col gap-1">
          <span className="font-bold max-sm:text-xs">
            c/{community.community.name}
          </span>
          <div className="flex flex-row items-center text-xs text-neutral-400">
            <div className="flex items-center gap-1">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "1rem" }}
              >
                communities
              </span>
              {FormatNumber(community?.counts?.subscribers, true)}
            </div>
            <div className="dividerDot"></div>
            <div className="flex items-center gap-1">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "1rem" }}
              >
                group
              </span>
              {community?.counts?.users_active_day} / Day
            </div>
            <div className="dividerDot"></div>
            <div className="flex items-center gap-1">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "1rem" }}
              >
                edit
              </span>
              {FormatNumber(community?.counts?.posts, true)}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function TrendingTopic({
  post,
  closeSearch,
}: {
  post: PostView;
  closeSearch: Function;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { bounce: 0.2 } }}
      exit={{ opacity: 0, y: 10 }}
    >
      <Link
        href={`/post/${post?.post?.id}?instance=${
          new URL(post?.community.actor_id).host
        }&preload=true`}
        onClick={() => {
          localStorage.setItem("currentPost", JSON.stringify(post));
          closeSearch();
        }}
        className=" flex flex-row justify-between rounded-xl border border-neutral-500 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="flex w-9/12 flex-row gap-2">
          <span
            className="material-symbols-outlined text-fuchsia-500 max-xs:hidden"
            style={{ fontSize: "1.5rem" }}
          >
            trending_up
          </span>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <span className="font-bold max-sm:text-xs">
                {post?.post?.name}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-300">
                c/{post?.community?.name}
              </span>
            </div>

            <div className="flex flex-row items-center text-xs text-neutral-400">
              <div className="flex items-center justify-center gap-1">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1rem" }}
                >
                  readiness_score
                </span>
                <span className="flex h-full items-center justify-center">
                  {post?.counts?.score}
                </span>
              </div>

              <div className="dividerDot"></div>

              <div className="flex items-center gap-1">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1rem" }}
                >
                  comment
                </span>
                <span>{post?.counts?.comments}</span>
              </div>
            </div>
          </div>
        </div>
        <Image
          height={80}
          width={80}
          className="h-20 w-20 overflow-hidden rounded-lg object-cover"
          src={post?.post?.thumbnail_url || post?.post?.url || ""}
          alt=""
        />
      </Link>
    </motion.div>
  );
}

export default function SearchOverlay({
  handleCloseSearchOverlay,
}: {
  handleCloseSearchOverlay: Function;
}) {
  const { session, setSession } = useSession();
  const [isSearching, setIsSearching] = useState(false);
  const [currentSearch, setCurrentSearch] = useState("");

  const [searchResults, setSearchResults] = useState<SearchResponse>(
    {} as SearchResponse,
  );
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [trendingCommunities, setTrendingCommunities] = useState<
    CommunityView[]
  >([]);
  const [trendingTopics, setTrendingTopics] = useState<PostView[]>([]);

  const [currentCategory, setCurrentCategory] = useState<
    "Posts" | "Communities" | "Users"
  >("Posts");

  const handleClose = () => {
    enablePageScroll();
    handleCloseSearchOverlay();
  };

  useEffect(() => {
    disablePageScroll();
  }, []);

  // get trending stuff on mount
  useEffect(() => {
    searchInputRef.current?.focus(); // Focus searchbar on mount

    getTrendingCommunities(session.currentAccount?.instance).then((data) => {
      if (typeof data === "boolean") return;
      setTrendingCommunities(data);
    });
    getTrendingTopics().then((data) => {
      if (typeof data === "boolean") return;
      setTrendingTopics(data);
    });
  }, []);

  // Update input value when user stops typing
  useEffect(() => {
    if (searchLoading)
      return console.warn("Not realoading, still loading results.");
    if (currentSearch?.length == 0) return setIsSearching(false);
    const timer = setTimeout(async () => {
      if (currentSearch.length == 0) return;
      if (currentSearch.length < 2) return;
      setCurrentPage(1);
      setSearchResults({} as SearchResponse);
      setHasMore(true);
      handleLoadMore();
      setIsSearching(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentSearch]);

  useEffect(() => {}, [currentCategory]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    handleLoadMore();
  };

  const search = async ({
    searchParams,
  }: {
    searchParams: Search;
  }): Promise<SearchResponse | undefined> => {
    setSearchLoading(true);
    try {
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

      const data: SearchResponse = await response.json();

      setSearchLoading(false);
      return data;
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleLoadMore = async () => {
    if (!hasMore) return;

    const data = await search({
      searchParams: {
        page: currentPage,
        q: currentSearch,
        auth: session?.currentAccount?.jwt || undefined,
      },
    });

    if (!data) return;

    let isEmpty = true;

    if (!searchResults?.posts) return setSearchResults(data);

    switch (currentCategory) {
      case "Posts":
        isEmpty = data.posts?.length == 0;
        // de dupe
        const uniquePosts = data.posts?.filter(
          (post) =>
            !searchResults.posts?.find((p) => p.post.id == post.post.id),
        );
        setSearchResults({
          ...searchResults,
          posts: [...searchResults?.posts, ...uniquePosts],
        });
        break;
      case "Communities":
        isEmpty = data.communities?.length == 0;
        const uniqueCommunities = data.communities?.filter(
          (community) =>
            !searchResults.communities?.find(
              (c) => c.community.id == community.community.id,
            ),
        );
        setSearchResults({
          ...searchResults,
          communities: [...searchResults?.communities, ...uniqueCommunities],
        });
        break;
      case "Users":
        isEmpty = data.users?.length == 0;
        setSearchResults({
          ...searchResults,
          users: [...searchResults?.users, ...data?.users],
        });
        break;
    }

    if (isEmpty) setHasMore(false);

    setCurrentPage(currentPage + 1);
  };

  return (
    <>
      <motion.div
        id="search"
        className={`${styles.searchOverlay} overflow-x-hidden bg-neutral-50/80
        backdrop-blur-xl dark:bg-neutral-950/90 `}
        initial={{ opacity: 0, y: 1000 }}
        animate={{ opacity: 1, y: 0, transition: { bounce: 0 } }}
        exit={{ opacity: 0, y: 1000 }}
      >
        <div
          className={`${styles.searchInputWrapper} border-neutral-300 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-950`}
        >
          <button onClick={() => handleClose()}>
            <span className="material-symbols-outlined text-neutral-400">
              arrow_back
            </span>
          </button>
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-row items-center"
          >
            <div
              onClick={() => searchInputRef?.current?.focus()}
              className={`${styles.searchInput} border-neutral-700 bg-neutral-200 p-4 dark:bg-neutral-950 dark:focus:border-neutral-400`}
            >
              <div className="flex w-full flex-row items-center gap-2">
                <span className="material-symbols-outlined select-none text-neutral-400">
                  search
                </span>
                <input
                  value={currentSearch}
                  onChange={(e) => setCurrentSearch(e.currentTarget.value)}
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search"
                  className="h-full w-full appearance-none bg-transparent font-bold outline-none"
                />
              </div>

              <button
                type="button"
                className="flex items-center justify-center"
                onClick={() => {
                  currentSearch.length == 0
                    ? handleClose()
                    : setCurrentSearch("");
                }}
              >
                <span className="material-symbols-outlined filled select-none text-neutral-400">
                  cancel
                </span>
              </button>
            </div>
          </form>
        </div>

        {!isSearching && (
          <div className={`${styles.searchOverlayTrending} overflow-y-auto`}>
            <div className="flex h-fit w-full flex-col gap-2">
              {trendingTopics.length > 0 && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { bounce: 0.2 } }}
                  exit={{ opacity: 0, y: 10 }}
                  className="ml-5 text-xs font-bold uppercase dark:text-neutral-200"
                >
                  Popular topics
                </motion.span>
              )}

              {trendingTopics?.map((post, index) => (
                <TrendingTopic
                  key={index}
                  post={post}
                  closeSearch={handleClose}
                />
              ))}
            </div>

            <div className="flex h-fit flex-col gap-2">
              {trendingCommunities.length > 0 && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { bounce: 0.2 } }}
                  exit={{ opacity: 0, y: 10 }}
                  className="ml-5 text-xs font-bold uppercase dark:text-neutral-200"
                >
                  Trending communities
                </motion.span>
              )}

              {trendingCommunities?.map((community, index) => (
                <TrendingCommunity
                  key={index}
                  community={community}
                  closeSearch={handleClose}
                />
              ))}
            </div>
          </div>
        )}

        {isSearching && (
          <>
            <div
              className="relative flex w-full flex-row items-center justify-center gap-2 py-5 max-sm:px-4"
              style={{ maxWidth: "42rem" }}
            >
              <Tabs
                variant="underlined"
                selectedKey={currentCategory}
                onSelectionChange={(key) =>
                  setCurrentCategory(key as "Posts" | "Communities" | "Users")
                }
              >
                <Tab
                  key="Posts"
                  title={<TabContent text="Posts" icon="edit" />}
                ></Tab>
                <Tab
                  key="Communities"
                  title={<TabContent text="Communities" icon="communities" />}
                ></Tab>
                <Tab
                  key="Users"
                  title={<TabContent text="Users" icon="person" />}
                ></Tab>
              </Tabs>
            </div>

            <div className="relative h-fit w-full max-w-full overflow-auto px-4 pb-10">
              <InfiniteScroll
                pageStart={2}
                loadMore={handleLoadMore}
                hasMore={hasMore}
                useWindow={false}
                loader={
                  <div
                    key={"loader"}
                    className=" flex h-20 w-full items-center justify-center py-5"
                  >
                    <ClipLoader size={20} color="#e6b0fa" />
                  </div>
                }
                className="relative flex h-fit flex-col gap-2"
              >
                {currentCategory == "Posts" &&
                  searchResults.posts?.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-center pt-2 "
                    >
                      <Post post={result} style="compact" />
                    </div>
                  ))}

                {currentCategory == "Communities" &&
                  searchResults.communities?.map((result, index) => (
                    <div key={index}>
                      <Community community={result} onClick={handleClose} />
                    </div>
                  ))}

                {currentCategory == "Users" &&
                  searchResults.users
                    ?.filter(
                      (user, index) =>
                        searchResults.users.findIndex(
                          (u) => u.person.id == user.person.id,
                        ) == index,
                    )
                    .map((result, index) => (
                      <div key={index}>
                        <Link
                          onClick={handleClose}
                          href={`/u/${result.person.name}@${
                            new URL(result.person.actor_id).host
                          }`}
                        >
                          <UserCard userData={result} />
                        </Link>
                      </div>
                    ))}

                {!hasMore && <EndlessScrollingEnd />}
              </InfiniteScroll>
            </div>
          </>
        )}
      </motion.div>
    </>
  );
}
