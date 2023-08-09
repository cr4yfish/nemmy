"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CommentSortType,
  CommentView,
  GetPersonDetailsResponse,
  PostView,
  SortType,
} from "lemmy-js-client";
import InfiniteScroll from "react-infinite-scroller";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useSession } from "@/hooks/auth";

import Loader from "@/components/ui/Loader";
import Post from "@/components/Post";
import RenderMarkdown from "@/components/ui/RenderMarkdown";
import EndlessScrollingEnd from "@/components/ui/EndlessSrollingEnd";
import { FilterType } from "../ui/FilterButton";
import CommentSingle from "../ui/CommentSingle";
import CardTypeButton from "../ui/CardTypeButton";
import SortButton from "../ui/SortButton";
import TabContent from "../ui/TabContent";

import { FormatNumber, isTextPost } from "@/utils/helpers";

import postListStyles from "@/styles/postList.module.css";
import styles from "@/styles/Pages/UserPage.module.css";

import {
  DEFAULT_AVATAR,
  DEFAULT_SORT_TYPE,
  DEFAULT_COMMENT_SORT_TYPE,
} from "@/constants/settings";
import {
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
  Tab,
  Tabs,
} from "@nextui-org/react";

function UserStat({ text, icon }: { text: string; icon: string }) {
  return (
    <>
      <div className={"flex flex-row flex-wrap gap-4 text-xs"}>
        <div className={`flex flex-row items-center gap-1 text-neutral-300 `}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "1rem" }}
          >
            {icon}
          </span>
          <span>{text}</span>
        </div>
      </div>
    </>
  );
}

export default function UserPage({
  initialUser,
  userInstance,
}: {
  initialUser: GetPersonDetailsResponse;
  userInstance: string;
}) {
  const { session } = useSession();

  const [userData, setUserData] =
    useState<GetPersonDetailsResponse>(initialUser);
  const [userDataError, setUserDataError] = useState(true);

  // posts stuff
  const [posts, setPosts] = useState<PostView[]>([]);
  const [comments, setComments] = useState<CommentView[]>([]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageLimit, setPageLimit] = useState<number>(10);
  const [morePages, setMorePages] = useState<boolean>(true);
  const [sort, setSort] = useState<SortType | CommentSortType>(
    DEFAULT_SORT_TYPE,
  );
  const [filter, setFilter] = useState<FilterType>("Posts");

  const router = useRouter();

  // community id
  const pathname = usePathname().split("/")[2];

  useEffect(() => {
    setPosts([]);
    setComments([]);
    setCurrentPage(1);
  }, [sort]);

  useEffect(() => {
    setSort(filter == "Posts" ? DEFAULT_SORT_TYPE : DEFAULT_COMMENT_SORT_TYPE);
    setPosts([]);
    setComments([]);
    setCurrentPage(1);
  }, [filter]);

  useEffect(() => {
    if (!userDataError) return;
    (async () => {
      const data = await fetch(
        `/api/getUser?username=${pathname}&instance=${session.currentAccount?.instanceAccounts[0]?.instance}&auth=${session.currentAccount?.instanceAccounts[0]?.jwt}`,
      );
      const json = await data.json();
      if (json.error) {
        console.error(json.error);
        setUserDataError(true);
      } else {
        setUserDataError(false);
        setUserData(json as GetPersonDetailsResponse);
        return;
      }
    })();
  }, [pathname, userDataError]);

  const getData = async ({ page = 1 }: { page?: number }) => {
    const data = await fetch(
      `/api/getUser?limit=${pageLimit}&page=${page}&username=${pathname}&sort=${sort}&instance=${session.currentAccount?.instanceAccounts[0]?.instance}&auth=${session.currentAccount?.instanceAccounts[0]?.jwt}`,
    );
    const json = await data.json();
    const posts = json.posts;
    const comments = json.comments;

    if (filter === "Comments") {
      if (comments.length === 0) setMorePages(false);
      return comments as CommentView[];
    } else if (filter === "Posts") {
      if (posts?.length === 0) setMorePages(false);
      return posts as PostView[];
    }
  };

  const handleLoadMore = async () => {
    const data = (await getData({ page: currentPage })) as any;

    if (filter == "Comments") {
      setComments([...comments, ...(data as CommentView[])]);
    } else if (filter == "Posts") {
      setPosts([...posts, ...(data as PostView[])]);
    }

    setCurrentPage(currentPage + 1);
  };

  let post_score = userData?.person_view?.counts?.post_score;
  let comment_score = userData?.person_view?.counts?.comment_score;
  let post_count = userData?.person_view?.counts?.post_count;
  let comment_count = userData?.person_view?.counts?.comment_count;

  let comment_amount = userData?.comments?.length;
  let post_amount = userData?.posts?.length;

  let karma = Math.ceil(
    ((post_score * 0.9 +
      comment_score * 0.5 +
      (comment_amount * 0.5 + post_amount * 0.9)) /
      (post_count * 0.75 + comment_count * 0.25)) *
      20,
  );

  return (
    <>
      <div className="mt-20 flex min-h-screen flex-col items-center overflow-x-hidden ">
        <div className={`${styles.userDetailsWrapper} `}>
          <div className={`${styles.userDetails}`}>
            <div
              className="relative z-10 flex w-full flex-col gap-2 overflow-hidden rounded-lg p-4"
              style={{ zIndex: "1" }}
            >
              <div
                className={`${styles.bannerOverlay} absolute left-0 top-0 h-full w-full bg-neutral-900/25 backdrop-blur-sm `}
              ></div>
              {userData?.person_view?.person?.banner && (
                <Image
                  height={200}
                  width={500}
                  src={userData.person_view.person.banner}
                  alt=""
                  className={`${styles.banner}`}
                />
              )}
              <div className={`${styles.userAvatar}`}>
                <Image
                  height={80}
                  width={80}
                  src={userData?.person_view?.person?.avatar || DEFAULT_AVATAR}
                  alt=""
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-0">
                  <h1 className=" text-3xl font-bold text-neutral-100">
                    {userData?.person_view?.person?.display_name ||
                      userData.person_view.person.name}
                  </h1>

                  <div className="flex flex-row items-center gap-4 max-sm:text-xs">
                    <span className="flex items-center justify-center font-light text-neutral-300">
                      @{userData?.person_view?.person?.name}
                    </span>
                  </div>
                </div>
                <div className="flex flex-row items-center">
                  <UserStat
                    icon="auto_awesome"
                    text={FormatNumber(karma, true).toString() + " Points"}
                  />

                  <div className="dividerDot"></div>

                  <UserStat
                    icon="cake"
                    text={new Date(
                      userData?.person_view?.person?.published,
                    ).toDateString()}
                  />
                </div>
              </div>
            </div>

            <span>
              <RenderMarkdown content={userData?.person_view?.person?.bio} />
            </span>

            <div className="flex flex-row items-center gap-2">
              <button className={`${styles.button} ${styles.buttonFuchsia}`}>
                <span className="material-symbols-outlined">
                  chat_bubble_outline
                </span>
                Message
              </button>
              <button className={`${styles.button} ${styles.buttonBlock}`}>
                <span className="material-symbols-outlined">block</span>Block
                user
              </button>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-4 bg-neutral-50 dark:bg-neutral-950 dark:pt-4">
          <div className={`${styles.sortsWrapper}  dark:text-neutral-300`}>
            <div className="flex w-full max-w-2xl flex-row items-center justify-between">
              <div className="relative flex flex-row flex-wrap items-center gap-4">
                <Tabs
                  className="max-sm:hidden"
                  variant="bordered"
                  selectedKey={filter}
                  onSelectionChange={(key) => setFilter(key as FilterType)}
                >
                  <Tab
                    key={"Posts"}
                    title={<TabContent text="Posts" icon="home" />}
                  ></Tab>
                  <Tab
                    key={"Comments"}
                    title={<TabContent text="Comments" icon="comment" />}
                  ></Tab>
                </Tabs>

                <div className=" hidden max-sm:block">
                  <Dropdown showArrow shadow="sm">
                    <DropdownTrigger>
                      <Button variant="bordered" style={{ height: "43.3px" }}>
                        {filter}{" "}
                        <span className="material-symbols-outlined text-sm">
                          expand_more
                        </span>
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      variant="faded"
                      onAction={(key) => setFilter(key as FilterType)}
                    >
                      <DropdownItem
                        key={"Posts"}
                        startContent={
                          <span className="material-symbols-outlined">
                            home
                          </span>
                        }
                      >
                        Posts
                      </DropdownItem>
                      <DropdownItem
                        key={"Comments"}
                        startContent={
                          <span className="material-symbols-outlined">
                            public
                          </span>
                        }
                      >
                        Comments
                      </DropdownItem>
                      <DropdownItem
                        key={"SavedOnly"}
                        startContent={
                          <span className="material-symbols-outlined">
                            location_on
                          </span>
                        }
                      >
                        Saved Only
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>

                {filter == "Posts" && (
                  <SortButton
                    current={sort}
                    setCurrent={setSort}
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
                )}

                {filter == "Comments" && (
                  <SortButton
                    current={sort}
                    setCurrent={setSort}
                    sections={[
                      {
                        title: "Sort by",
                        options: [
                          {
                            label: "Hot",
                            key: "Hot",
                            icon: "whatshot",
                          },
                          {
                            label: "Top",
                            key: "Top",
                            icon: "trending_up",
                          },
                          {
                            label: "New",
                            key: "New",
                            icon: "history",
                          },
                          {
                            label: "Old",
                            key: "Old",
                            icon: "hourglass_top",
                          },
                        ],
                      },
                    ]}
                  />
                )}
              </div>

              <CardTypeButton />
            </div>
          </div>

          <div
            className="flex min-h-screen max-w-3xl flex-col items-center 
                    justify-start max-md:w-full"
          >
            <InfiniteScroll
              pageStart={1}
              loadMore={async () => await handleLoadMore()}
              hasMore={morePages}
              loader={<Loader key={"loader"} />}
              className={`${postListStyles.postList} `}
            >
              {posts.map((post: PostView, index: number) => {
                return (
                  <Post
                    post={post}
                    key={post.post.id}
                    instance={
                      session.currentAccount?.instanceAccounts[0]?.instance
                    }
                    instanceAccount={
                      session.currentAccount?.instanceAccounts[0]
                    }
                    postInstance={
                      session.currentAccount?.instanceAccounts[0]?.instance
                    }
                    style={
                      session.settings?.cardType !== "auto"
                        ? session.settings?.cardType
                        : isTextPost(post)
                        ? "compact"
                        : "modern"
                    }
                  />
                );
              })}

              {comments.map((comment: CommentView, index: number) => {
                return (
                  <CommentSingle comment={comment} key={comment.comment.id} />
                );
              })}

              {!morePages && <EndlessScrollingEnd key={"end"} />}
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </>
  );
}
