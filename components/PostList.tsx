"use client";

import { useState, useEffect, cache } from "react";
import { CommunityId, ListingType, PostView, SortType } from "lemmy-js-client";
import InfiniteScroll from "react-infinite-scroller";
import { AnimatePresence, motion } from "framer-motion";
import va from "@vercel/analytics";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Button,
  Tabs,
  Tab,
} from "@nextui-org/react";

import { useSession } from "@/hooks/auth";

import EndlessScrollingEnd from "./ui/EndlessSrollingEnd";
import Loader from "./ui/Loader";
import SortButton from "./ui/SortButton";
import CardTypeButton from "./ui/CardTypeButton";
import Post from "./Post";
import TabContent from "./ui/TabContent";

import { DEFAULT_INSTANCE, DEFAULT_POST_LIMIT } from "@/constants/settings";

import { isTextPost } from "@/utils/helpers";

import styles from "../styles/postList.module.css";

/**
 * PostList
 */
export default function PostList({
  fetchParams = { limit: DEFAULT_POST_LIMIT, page: 1 },
  initPosts,
  style = "modern", // modern or compact
  showCommunity = true,
  showTypeSwitch = true,
  showUserTypeSwitch = false,
  overrideInstance,
}: {
  fetchParams?: {
    type_?: ListingType;
    sort?: SortType;
    page?: number;
    limit?: number;
    community_id?: CommunityId;
    community_name?: string;
    saved_only?: boolean;
    auth?: string;
  };
  initPosts?: PostView[];
  style?: "modern" | "compact";
  showCommunity?: boolean;
  showTypeSwitch?: boolean;
  showUserTypeSwitch?: boolean;
  overrideInstance?: string;
}) {
  const { session, setSession } = useSession();
  const [posts, setPosts] = useState<PostView[]>(initPosts || []);
  const [currentPage, setCurrentPage] = useState<number>(fetchParams.page || 1);
  const [morePages, setMorePages] = useState<boolean>(true);
  const [currentSort, setCurrentSort] = useState<SortType>(
    fetchParams.sort || "Active",
  );
  const [currentType, setCurrentType] = useState<ListingType>(
    fetchParams.type_ || "All",
  );

  useEffect(() => {
    setPosts([]);
    setCurrentPage(1);
  }, [fetchParams?.sort, currentSort]);

  useEffect(() => {
    setPosts([]);
    setCurrentPage(1);
  }, [fetchParams.type_, currentType]);

  const getPosts = cache(async ({ page = 1 }: { page?: number }) => {
    const data = await fetch(
      `/api/getPosts?page=${page}&community_name=${fetchParams.community_name}&auth=${session?.currentAccount?.jwt}&sort=${currentSort}&type_=${currentType}&instance=${overrideInstance || session.currentAccount?.instance}`,
    );
    const json = (await data.json()).posts;
    if (json?.length === 0) {
      setMorePages(false);
    }
    return json as PostView[];
  });

  const handleClickPost = (currenPost: PostView) => {
    va.track("Clicked post on feed", {
      instance: overrideInstance || session.currentAccount?.instance || DEFAULT_INSTANCE,
    });
    localStorage.setItem("currentPost", JSON.stringify(currenPost));
  };

  const handleLoadMore = cache(async () => {
    const data = await getPosts({ page: currentPage });
    if (!data) return;

    // Filter out duplicates
    // Duplicates can happen when a posts changes ranking between page loads
    const uniquePosts = data.filter((post) => {
      return !posts.some((post2) => post.post.id === post2.post.id);
    });

    // Filter out deleted and removed posts
    const filteredPosts = uniquePosts.filter((post) => {
      return post.post.removed === false && post.post.deleted === false;
    });

    setPosts((prevState) => {
      return [...prevState, ...filteredPosts];
    });
    setCurrentPage(currentPage + 1);
  });

  return (
    <>
      <motion.div
        id="postList"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { bounce: 0.1 } }}
        exit={{ opacity: 0 }}
        className="flex w-fit max-w-2xl flex-col gap-2 px-4 max-md:w-full max-sm:px-0"
      >
        <div className="flex h-16 w-full flex-row items-center justify-between gap-2 overflow-x-auto pb-4 max-sm:px-4">
          <div className="flex items-center gap-2">
            {showTypeSwitch && (
              <>
                <Tabs
                  className="max-sm:hidden"
                  variant="bordered"
                  disabledKeys={
                    session.currentAccount?.jwt ? [] : ["Subscribed"]
                  }
                  selectedKey={currentType}
                  onSelectionChange={(key) =>
                    setCurrentType(key as ListingType)
                  }
                >
                  <Tab
                    key={"Subscribed"}
                    title={<TabContent text="Home" icon="home" />}
                  ></Tab>
                  <Tab
                    key={"All"}
                    title={<TabContent text="All" icon="public" />}
                  ></Tab>
                  <Tab
                    key={"Local"}
                    title={
                      <TabContent
                        text={overrideInstance || session.currentAccount?.instance || "Local"}
                        icon="location_on"
                      />
                    }
                  ></Tab>
                </Tabs>

                <div className=" hidden max-sm:block">
                  <Dropdown showArrow shadow="sm">
                    <DropdownTrigger>
                      <Button variant="bordered" style={{ height: "43.3px" }}>
                        {currentType}{" "}
                        <span className="material-symbols-outlined text-sm">
                          expand_more
                        </span>
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      variant="faded"
                      onAction={(key) => setCurrentType(key as ListingType)}
                    >
                      <DropdownItem
                        key={"Subscribed"}
                        startContent={
                          <span className="material-symbols-outlined">
                            home
                          </span>
                        }
                      >
                        Home
                      </DropdownItem>
                      <DropdownItem
                        key={"All"}
                        startContent={
                          <span className="material-symbols-outlined">
                            public
                          </span>
                        }
                      >
                        All
                      </DropdownItem>
                      <DropdownItem
                        key={"Local"}
                        startContent={
                          <span className="material-symbols-outlined">
                            location_on
                          </span>
                        }
                      >
                        Local
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </>
            )}

            <SortButton
              current={currentSort}
              setCurrent={setCurrentSort}
              sections={[
                {
                  title: "Most used",
                  options: [
                    {
                      label: "Active",
                      key: "Active",
                      icon: "stream",
                    },
                    {
                      label: "Hot",
                      key: "Hot",
                      icon: "whatshot",
                    },
                    {
                      label: "Top Day",
                      key: "TopDay",
                      icon: "trending_up",
                    },
                    {
                      label: "New",
                      key: "New",
                      icon: "history",
                    },
                  ],
                },
                {
                  title: "Others",
                  options: [
                    {
                      label: "Old",
                      key: "Old",
                      icon: "hourglass_top",
                    },
                    {
                      label: "Most Comments",
                      key: "MostComments",
                      icon: "comment",
                    },
                    {
                      label: "Top 6h",
                      key: "TopSixHour",
                      icon: "counter_6",
                    },
                    {
                      label: "Top All",
                      key: "TopAll",
                      icon: "calendar_today",
                    },
                  ],
                },
              ]}
            />
          </div>

          <CardTypeButton />
        </div>

        <div className=" flex w-full justify-center">
          <InfiniteScroll
            pageStart={1}
            loadMore={async () => await handleLoadMore()}
            hasMore={morePages}
            loader={
              <AnimatePresence key={"loaderWrapper"}>
                <Loader key={"loaderCard"} />
              </AnimatePresence>
            }
            className={`${styles.postList} pb-10`}
            key={"postList"}
          >
            {posts
              .filter((post) => {
                // only filter if blockedInstances is set
                if (session.settings.blockedInstances !== undefined) {
                  return !session.settings?.blockedInstances?.includes(
                    new URL(post.community.actor_id)?.host,
                  );
                } else {
                  return true;
                }
              })
              .filter((post, index) => {
                return (
                  posts.findIndex((post2) => post2.post.id === post.post.id) ===
                  index
                );
              })
              .map((post: PostView, index: number) => {
                return (
                  <AnimatePresence key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className=" w-full"
                    >
                      <Post
                        onClick={() => handleClickPost(post)}
                        post={post}
                        instance={overrideInstance || session.currentAccount?.instance}
                        auth={session.currentAccount?.jwt}
                        key={index}
                        postInstance={new URL(post.community.actor_id).host}
                        style={
                          session.settings?.cardType !== "auto"
                            ? session.settings?.cardType
                            : isTextPost(post)
                            ? "compact"
                            : "modern"
                        }
                        showCommunity={showCommunity}
                      />
                    </motion.div>
                  </AnimatePresence>
                );
              })}

            {!morePages && posts.length > 0 && (
              <EndlessScrollingEnd key={"end"} />
            )}
          </InfiniteScroll>
        </div>
      </motion.div>
    </>
  );
}
