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

import { useNavbar } from "@/hooks/navbar";
import { useSession } from "@/hooks/auth";

import Loader from "@/components/ui/Loader";
import Post from "@/components/Post";
import RenderMarkdown from "@/components/ui/RenderMarkdown";
import EndlessScrollingEnd from "@/components/ui/EndlessSrollingEnd";
import SortButton from "../ui/SortButton";
import FilterButton, { FilterType } from "../ui/FilterButton";
import CommentSingle from "../ui/CommentSingle";

import { FormatNumber } from "@/utils/helpers";

import postListStyles from "@/styles/postList.module.css";
import styles from "@/styles/Pages/UserPage.module.css";

import { DEFAULT_AVATAR, DEFAULT_SORT_TYPE } from "@/constants/settings";

function UserStat({ text, icon } : { text: string, icon: string }) {
  return (
    <>
    <div className={"flex flex-row flex-wrap gap-4 text-xs"}>
      <div className={`flex flex-row gap-1 items-center`}>
        <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>{icon}</span>
        <span>{text}</span>
      </div>
    </div>
    </>
  )
}

export default function UserPage({
  initialUser,
  userInstance,
}: {
  initialUser: GetPersonDetailsResponse;
  userInstance: string;
}) {
  const { navbar, setNavbar } = useNavbar();
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
    setNavbar({
      ...navbar!,
      showFilter: false,
      showSort: false,
      showSearch: true,
      showUser: true,
      showback: true,
      titleOverride: "",
    });
  }, []);

  useEffect(() => {
    setPosts([]);
    setComments([]);
    setCurrentPage(1);
  }, [sort]);

  useEffect(() => {
    setPosts([]);
    setComments([]);
    setCurrentPage(1);
  }, [filter]);

  useEffect(() => {
    if (!userDataError) return;
    (async () => {
      const data = await fetch(
        `/api/getUser?username=${pathname}&instance=${session.currentAccount?.instance}`,
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
      `/api/getUser?limit=${pageLimit}&page=${page}&username=${pathname}&sort=${sort}&instance=${session
        .currentAccount?.instance}&saved_only=${filter === "SavedOnly"}`,
    );
    const json = await data.json();
    const posts = json.posts;
    const comments = json.comments;

    if (filter === "Comments") {
      if (comments.length === 0) setMorePages(false);
      return comments as CommentView[];
    } else if (filter === "Posts") {
      if (posts.length === 0) setMorePages(false);
      return posts as PostView[];
    } else if (filter === "SavedOnly") {
      if (posts.length === 0) setMorePages(false);
      return { posts: posts as PostView[], comments: comments as CommentView };
    }
  };

  const handleLoadMore = async () => {
    const data = (await getData({ page: currentPage })) as any;

    if (filter == "Comments") {
      setComments([...comments, ...(data as CommentView[])]);
    } else if (filter == "Posts") {
      setPosts([...posts, ...(data as PostView[])]);
    } else if (filter == "SavedOnly") {
      setPosts([...posts, ...(data.posts as PostView[])]);
      setComments([...comments, ...(data.comments as CommentView[])]);
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

      <div className="mt-20 flex min-h-screen flex-col items-center overflow-x-hidden">
        <div className={`${styles.userDetailsWrapper} `}>
          <div className={`${styles.userDetails}`}>
 
            <div className="flex flex-col gap-2 relative w-full overflow-hidden rounded-lg p-4">
                <div className={`${styles.bannerOverlay} `}></div>
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
                  <h1 className=" text-3xl font-bold">
                    {userData?.person_view?.person?.display_name}
                  </h1>

                  <div className="flex flex-row items-center gap-4 max-sm:text-xs">

                    <span className="flex items-center justify-center font-light">
                      @{userData?.person_view?.person?.name}
                    </span>
                    
                  </div>
                </div>
                <div className="flex flex-row items-center">

                  <UserStat icon="auto_awesome" text={FormatNumber(karma, true).toString() + " Points"} />

                  <div className="dividerDot"></div>

                  <UserStat icon="cake" text={new Date(userData?.person_view?.person?.published).toDateString()} />

                </div>
                
              </div>


            </div>

              <span>
                <RenderMarkdown content={userData?.person_view?.person?.bio} />
              </span>

              <div className="flex flex-row items-center gap-2">
                <button className={`${styles.button} ${styles.buttonFuchsia}`}>
                  <span className="material-icons-outlined">
                    chat_bubble_outline
                  </span>
                  Message
                </button>
                <button className={`${styles.button} ${styles.buttonBlock}`}>
                  <span className="material-icons">block</span>Block user
                </button>
              </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-4 bg-neutral-50 dark:bg-neutral-950 dark:pt-4">
          <div className={`${styles.sortsWrapper}`}>
            <div className="relative flex flex-row flex-wrap items-center gap-4">
              <SortButton onChange={(newSort: SortType) => setSort(newSort)} />

              <FilterButton
                onChange={(newFilter: FilterType) => setFilter(newFilter)}
              />
            </div>

            <div className="flex items-center">
              <span className="material-icons-outlined">view_day</span>
            </div>
          </div>

          <div
            className="flex min-h-screen max-w-3xl flex-col items-center 
                    justify-start bg-neutral-50 dark:bg-neutral-900 max-md:w-full"
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
                    instance={session.currentAccount?.instance}
                    auth={session.currentAccount?.jwt}
                    postInstance={session.currentAccount?.instance}
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
