"use client";

import { useState, useEffect, cache } from "react";
import { CommunityId, ListingType, PostView, SortType } from "lemmy-js-client";
import InfiniteScroll from "react-infinite-scroller";
import { AnimatePresence, motion } from "framer-motion";
import va from "@vercel/analytics";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Button, Tabs, Tab, DropdownSection } from "@nextui-org/react";

import { useSession } from "@/hooks/auth";
import { useNavbar } from "@/hooks/navbar";

import EndlessScrollingEnd from "./ui/EndlessSrollingEnd";
import Loader from "./ui/Loader";

import { DEFAULT_INSTANCE, DEFAULT_POST_LIMIT } from "@/constants/settings";

import Post from "./Post";

import styles from "../styles/postList.module.css";


function TabContent({ text, icon }: { text: string; icon: string }) {
  return (
    <div className="flex items-center gap-1">
      <span
        className="material-symbols-outlined"
        style={{ fontSize: ".75rem" }}
      >
        {icon}
      </span>
      <span className="max-xs:hidden">{text}</span>
    </div>
  );
}

/**
 * PostList
 */
export default function PostList({
  fetchParams = { limit: DEFAULT_POST_LIMIT, page: 1 },
  initPosts,
  setCurrentPost = () => null,
  style = "modern", // modern or compact
  showCommunity = true,
  showTypeSwitch = true,
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
  setCurrentPost?: Function;
  style?: "modern" | "compact";
  showCommunity?: boolean;
  showTypeSwitch?: boolean;
}) {
  const { session, setSession } = useSession();
  const { navbar, setNavbar } = useNavbar();

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
    setNavbar({
      ...navbar!,
      showMenu: true,
      showSort: false,
      showFilter: false,
      showSearch: true,
      showUser: true,
      showback: false,
      hidden: false,
      titleOverride: "",
    });
  }, []);

  useEffect(() => {
    setPosts([]);
    setCurrentPage(1);
  }, [navbar?.currentSort, fetchParams?.sort, currentSort]);

  useEffect(() => {
    setPosts([]);
    setCurrentPage(1);
  }, [navbar?.currentType, currentType, fetchParams.type_]);

  const getPosts = cache(async ({ page = 1 }: { page?: number }) => {
    const data = await fetch(
      `/api/getPosts?page=${page}&community_name=${fetchParams.community_name}&auth=${session?.currentAccount?.jwt}&sort=${currentSort}&type_=${currentType}&instance=${session.currentAccount?.instance}`,
    );
    const json = (await data.json()).posts;
    if (json?.length === 0) {
      setMorePages(false);
    }
    return json as PostView[];
  });

  const handleClickPost = (currenPost: PostView) => {
    va.track("Clicked post on feed", {
      instance: session.currentAccount?.instance || DEFAULT_INSTANCE,
    });
    localStorage.setItem("currentPost", JSON.stringify(currenPost));
  };

  const handleLoadMore = async () => {
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
  };

  const isTextPost = (post: PostView) => {
    if (post.post.url) return false;
    if (post.post.thumbnail_url) return false;
    if (post.post.embed_video_url) return false;
    return true;
  };

  return (
    <motion.div
      id="postList"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { bounce: 0.1 } }}
      exit={{ opacity: 0 }}
      className="w-fit max-w-2xl px-4 max-md:w-full max-sm:px-0 flex flex-col gap-2"
    >

      <div className="flex flex-row items-center gap-2 justify-between max-sm:px-4 overflow-x-auto w-full pb-4 h-16">
        
        <div className="flex items-center gap-2">
          
          {showTypeSwitch && <>
            <Tabs 
              className="max-sm:hidden"
              variant="bordered"
              disabledKeys={session.currentAccount?.jwt ? [] : ["Subscribed"]}
              selectedKey={currentType} onSelectionChange={(key) => setCurrentType(key as ListingType)}
              >
              <Tab key={"Subscribed"} title={<TabContent text="Home" icon="home" />}></Tab>
              <Tab key={"All"} title={<TabContent text="All" icon="public" />}></Tab>
              <Tab key={"Local"} title={<TabContent text={session.currentAccount?.instance || "Local"} icon="location_on" />}></Tab>
            </Tabs>

            <div className=" hidden max-sm:block">
            <Dropdown showArrow shadow="sm">
              <DropdownTrigger>
                <Button variant="bordered" style={{ height: "43.3px" }}  >
                  {currentType} <span className="text-sm material-symbols-outlined">expand_more</span>
                </Button>
              </DropdownTrigger>
              <DropdownMenu variant="faded" onAction={(key) => setCurrentType(key as ListingType)}>
                <DropdownItem key={"Subscribed"} startContent={<span className="material-symbols-outlined">home</span>}>Home</DropdownItem>
                <DropdownItem key={"All"} startContent={<span className="material-symbols-outlined">public</span>}>All</DropdownItem>
                <DropdownItem key={"Local"} startContent={<span className="material-symbols-outlined">location_on</span>}>Local</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            </div>
          </>}

          <Dropdown showArrow shadow="sm">
            <DropdownTrigger>
              <Button variant="bordered" style={{ height: "43.3px" }}>
                {currentSort} <span className="text-sm material-symbols-outlined">expand_more</span>
              </Button>
            </DropdownTrigger>
            <DropdownMenu variant="faded" onAction={(key) => setCurrentSort(key as SortType)}>

              <DropdownSection title={"Most used"}>
                <DropdownItem key={"Active"} startContent={<span className="active m-2"></span>}>Active</DropdownItem>
                <DropdownItem key={"Hot"} startContent={<span className="material-symbols-outlined">whatshot</span>}>Hot</DropdownItem>
                <DropdownItem key={"TopDay"} startContent={<span className="material-symbols-outlined">trending_up</span>}>Top Day</DropdownItem>
                <DropdownItem key={"New"} startContent={<span className="material-symbols-outlined">history</span>}>New</DropdownItem>
            </DropdownSection>

              <DropdownSection title={"Others"}>
                  <DropdownItem key={"Old"} startContent={<span className="material-symbols-outlined">hourglass_top</span>}>Old</DropdownItem>
                  <DropdownItem key={"MostComments"} startContent={<span className="material-symbols-outlined">comment</span>}>Most Comments</DropdownItem>
                  <DropdownItem key={"TopSixHour"} startContent={<span className="material-symbols-outlined">counter_6</span>}>Top 6h</DropdownItem>
                  <DropdownItem key={"TopAll"} startContent={<span className="material-symbols-outlined">calendar_today</span>}>Top All</DropdownItem>
              </DropdownSection>

            </DropdownMenu>
          </Dropdown>
        </div>

        <Dropdown showArrow>
          <DropdownTrigger>
            <Button variant="bordered" style={{ height: "43.3px" }}>
              
              <span className="material-symbols-outlined">
                {session.settings.cardType == "auto" && "auto_awesome"}
                {session.settings.cardType == "modern" && "view_agenda"}
                {session.settings.cardType == "compact" && "view_list"}
              </span>
              <span className="max-sm:hidden capitalize">{session.settings.cardType}</span>
            </Button>
          </DropdownTrigger>
          <DropdownMenu 
            variant="faded" 
            onAction={(newKey) => setSession(prevValue => { return { ...prevValue, settings: { ...prevValue.settings, cardType: newKey as "auto" | "modern" | "compact"} }})}>
            <DropdownItem key={"auto"} startContent={<span className=" material-symbols-outlined">auto_awesome</span>} >Auto</DropdownItem>
            <DropdownItem key={"modern"} startContent={<span className=" material-symbols-outlined">view_agenda</span>}>Modern</DropdownItem>
            <DropdownItem key={"compact"} startContent={<span className=" material-symbols-outlined">view_list</span>}>Compact</DropdownItem>
          </DropdownMenu>
        </Dropdown>

      </div>

      <div className=" flex w-full justify-center">
        <InfiniteScroll
          pageStart={1}
          loadMore={async () => await handleLoadMore()}
          hasMore={morePages}
          loader={<AnimatePresence key={"loaderWrapper"}><Loader key={"loaderCard"} /></AnimatePresence>}
          className={`${styles.postList} pb-10`}
          key={"postList"}
        >
          {posts
            .filter((post) => {
              // only filter if blockedInstances is set
              if (session.settings.blockedInstances !== undefined) {
                return !session.settings?.blockedInstances?.includes(
                  new URL(post.post.ap_id)?.host,
                );
              } else {
                return true;
              }
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
                      instance={session.currentAccount?.instance}
                      auth={session.currentAccount?.jwt}
                      key={index}
                      postInstance={new URL(post.post.ap_id).host}
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
  );
}
