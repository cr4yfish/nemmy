"use client";

import { useEffect, useState } from "react";
import {
  CommentSortType,
  CommentView,
  GetPersonDetailsResponse,
  PostView,
  SortType,
} from "lemmy-js-client";
import InfiniteScroll from "react-infinite-scroller";

import { useSession } from "@/hooks/auth";

import Loader from "@/components/ui/Loader";
import Post from "@/components/Post";
import EndlessScrollingEnd from "@/components/ui/EndlessSrollingEnd";
import { FilterType } from "../ui/FilterButton";
import CommentSingle from "../ui/CommentSingle";
import CardTypeButton from "../ui/CardTypeButton";
import SortButton from "../ui/SortButton";
import TabContent from "../ui/TabContent";

import { isTextPost } from "@/utils/helpers";

import postListStyles from "@/styles/postList.module.css";
import styles from "@/styles/Pages/UserPage.module.css";

import {
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
import { Account } from "@/utils/authFunctions";

export default function BookmarkPage({
  initialGetPersonDetailsResponse,
  currentUser,
}: {
  initialGetPersonDetailsResponse: GetPersonDetailsResponse;
  currentUser: Account;
}) {
  const { session } = useSession();

  // posts stuff
  const [posts, setPosts] = useState<PostView[]>([]);
  const [comments, setComments] = useState<CommentView[]>([]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [morePages, setMorePages] = useState<boolean>(true);
  const [sort, setSort] = useState<SortType | CommentSortType>(
    DEFAULT_SORT_TYPE,
  );
  const [filter, setFilter] = useState<FilterType>("Posts");
  useEffect(() => {
    setCurrentPage(1);
  }, [sort]);

  useEffect(() => {
    setSort(filter == "Posts" ? DEFAULT_SORT_TYPE : DEFAULT_COMMENT_SORT_TYPE);
    setCurrentPage(1);
  }, [filter]);

  const getData = async ({ page = 1 }: { page?: number }) => {
    const data = await fetch(
      `/api/getUser?&page=${page}&username=${currentUser.username}&sort=${sort}&instance=${currentUser.instanceAccounts[0]?.instance}&saved_only=true&auth=${currentUser.instanceAccounts[0]?.jwt}`,
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

  return (
    <>
      <div className="flex min-h-screen w-full flex-col items-center overflow-x-hidden ">
        <div className="flex w-full flex-col items-center gap-4 bg-neutral-50 dark:bg-neutral-950 dark:pt-4">
          <div className={` w-full  dark:text-neutral-300`}>
            <div className="flex w-full max-w-2xl flex-row items-center justify-between">
              <div className="relative flex w-full flex-row flex-wrap items-center gap-4">
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
            className="flex min-h-screen w-full flex-col items-center justify-start overflow-hidden"
            style={{ maxWidth: "42rem" }}
          >
            <InfiniteScroll
              pageStart={1}
              loadMore={async () => await handleLoadMore()}
              hasMore={morePages}
              loader={<Loader key={"loader"} />}
              className={`${postListStyles.postList} `}
            >
              {filter == "Posts" &&
                posts.map((post: PostView, index: number) => {
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

              {filter == "Comments" &&
                comments.map((comment: CommentView, index: number) => {
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
