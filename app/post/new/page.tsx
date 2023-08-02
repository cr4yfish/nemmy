"use client";

import { FormEvent, useEffect, useState, useRef } from "react";
import { CommunityView, CreatePost } from "lemmy-js-client";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import InfiniteScroll from "react-infinite-scroller";

import RenderFormattingOptions from "@/components/ui/RenderFormattingOptions";
import RenderMarkdown from "@/components/ui/RenderMarkdown";

import { listCommunities, createPost } from "@/utils/lemmy";
import { FormatNumber } from "@/utils/helpers";

import { useNavbar } from "@/hooks/navbar";
import { useSession } from "@/hooks/auth";

import { DEFAULT_AVATAR } from "@/constants/settings";

import styles from "@/styles/Pages/NewPost.module.css";
import EndlessScrollingEnd from "@/components/ui/EndlessSrollingEnd";

function CommunityCard({ community }: { community: CommunityView }) {
  return (
    <div className="flex h-full w-full flex-row items-center justify-start gap-2 transition-all duration-100 dark:hover:translate-y-1 max-md:hover:translate-y-0">
      <Image
        height={32}
        width={32}
        src={community?.community?.icon || DEFAULT_AVATAR}
        alt=""
        className="h-8 w-8 overflow-hidden rounded-full object-contain"
      />
      <div className="flex h-full flex-col items-start justify-center">
        <span className="font-bold">c/{community?.community?.name}</span>
        <div className="flex flex-row items-center">
          <span className="text-xs text-neutral-400">
            {FormatNumber(community?.counts?.subscribers, true)} Subscribers
          </span>
          <div className="dividerDot"></div>
          <span className="text-xs text-neutral-400">
            {new URL(community?.community?.actor_id)?.host}
          </span>
        </div>
      </div>
    </div>
  );
}

const list = {
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.05,
      type: "spring",
      bounce: 0,
      duration: 0.25,
    },
  },
  hidden: {
    opacity: 0,
    transition: {
      when: "afterChildren",
    },
  },
};

const item = {
  visible: { opacity: 1, y: 0 },
  hidden: { opacity: 0, y: 100 },
};

export default function New() {
  const { navbar, setNavbar } = useNavbar();
  const { session } = useSession();
  const [form, setForm] = useState<CreatePost>({} as CreatePost);
  const [step, setStep] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectionStart, setSelectionStart] = useState<number>(0);

  const router = useRouter();

  const [communities, setCommunities] = useState<CommunityView[]>([]);
  const [currentCommunityPage, setCurrentCommunityPage] = useState<number>(1);
  const [hasMoreCommunities, setHasMoreCommunities] = useState<boolean>(true);
  const [communitySearch, setCommunitySearch] = useState<string>("");
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityView>(
    {} as CommunityView,
  );
  const [communityRulesPopup, setCommunityRulesPopup] =
    useState<boolean>(false);

  // Check if user is logged in
  useEffect(() => {
    if (session.pendingAuth) return;
    if (!session.currentAccount?.jwt) {
      router.push("/auth");
    }
  }, [session]);

  useEffect(() => {
    if (navbar!.hidden) return;

    navbar &&
      setNavbar({
        ...navbar,
        hidden: true,
      });
  }, [navbar, setNavbar]);

  const loadMoreCommunities = async (page = 1) => {
    if (!session.currentAccount?.jwt) return;
    const newCommunities = await listCommunities(
      {
        sort: "Hot",
        type_: "Subscribed",
        page: page,
        auth: session.currentAccount.jwt,
      },
      session.currentAccount.instance,
    );
    if (typeof newCommunities === "boolean")
      return console.error("Failed to fetch communities");
    if (newCommunities.communities.length == 0)
      return setHasMoreCommunities(false);

    // de-dupe communities
    let uniqueCommunities = newCommunities.communities.filter(
      (c) => !communities.find((c2) => c2.community.id == c.community.id),
    );

    setCommunities([...communities, ...uniqueCommunities]);
    setCurrentCommunityPage(page + 1);
  };

  useEffect(() => {
    loadMoreCommunities();
  }, [session.currentAccount]);

  // Adjust textarea height to content on user input
  useEffect(() => {
    const textarea = textareaRef.current;

    function adjustHeight() {
      if (!textarea) return;
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }

    textarea?.addEventListener("input", adjustHeight);
    adjustHeight();

    // Cleanup on onmount
    return () => {
      textarea?.removeEventListener("input", adjustHeight);
    };
  }, []);

  // manually fire input event on change
  // This is a hack to update the textarea height when
  // inserting using markdown formatting options
  useEffect(() => {
    // manually fire input event on change
    textareaRef.current?.dispatchEvent(new Event("input"));
  }, [form.body])
  // weird react hack to get correct selection index
  useEffect(() => {
    const textarea = textareaRef.current;

    textarea?.addEventListener("selectionchange", () => {
      setSelectionStart(textarea?.selectionStart || 0);
    })

    return () => {
      setSelectionStart(textarea?.selectionStart || 0)
    }

  }, [textareaRef.current?.selectionStart])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  const handleStep0 = (e: FormEvent) => {
    handleSubmit(e);
    setStep(1);
  };

  const handleStep1 = (community: CommunityView) => {
    setForm({ ...form, community_id: community?.community?.id });
    setSelectedCommunity(community);
    setStep(2);
  };

  const handleStep2 = async (e: FormEvent) => {
    handleSubmit(e);
    if (!session.currentAccount) return alert("You must be logged in to post");

    const res = await createPost({
      name: form.name,
      community_id: form.community_id,
      url: form.url,
      body: form.body,
      nsfw: form.nsfw,
      language_id: form.language_id,
      auth: session.currentAccount.jwt,
    });

    if (typeof res == "boolean") return alert("Failed to create post");

    const postUrl = res.post_view.post.id;

    router.push("/post/" + postUrl);
  };

  const handleClose = () => {
    router.push("/");
  };

  return (
    <div className="flex w-full justify-center">
      <div
        className={`flex min-h-screen w-full flex-col items-center justify-center bg-neutral-50 p-20 dark:bg-neutral-950 max-md:p-0 `}
      >
        {step == 0 && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`${styles.header} justify-between`}
            >
              <button
                onClick={handleClose}
                className="flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <button
                type="submit"
                form="stepzero"
                className="font-bold text-fuchsia-500"
              >
                Continue
              </button>
            </motion.div>
          </AnimatePresence>
        )}

        {step == 1 && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`${styles.header} justify-start`}
            >
              <button
                onClick={() => setStep(0)}
                className="flex items-center justify-center"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>

              <span className="text-xl font-bold text-neutral-950 dark:text-neutral-100 max-sm:text-xs">
                Select a Community to post in
              </span>
            </motion.div>
          </AnimatePresence>
        )}

        {step == 2 && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`${styles.header} justify-between`}
            >
              <button
                onClick={handleClose}
                className="flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <button
                type="submit"
                form="steptwo"
                className="rounded-lg bg-fuchsia-500 p-2 px-4 font-bold text-fuchsia-950"
              >
                Post
              </button>
            </motion.div>
          </AnimatePresence>
        )}

        <AnimatePresence mode="popLayout">
          {step == 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: "-500%" }}
              className="mt-16 flex h-full w-full max-w-3xl flex-col  gap-4 p-4 max-sm:w-full"
            >
              <form
                id="stepzero"
                onSubmit={(e) => handleStep0(e)}
                className="flex w-full flex-col gap-2"
              >
                <div className="mt-4 w-full">
                  <input
                    required
                    value={form.name || ""}
                    onChange={(e) =>
                      setForm({ ...form, name: e.currentTarget.value })
                    }
                    type="text"
                    placeholder="An interesting title"
                    className={`${styles.input}`}
                  />
                </div>

                <div className="flex w-full flex-row gap-2 overflow-x-auto border-b border-neutral-300 pb-2 max-sm:pb-4">
                  <RenderFormattingOptions 
                    text={form.body} 
                    setText={(newText: string) => setForm(prevState => { return { ...prevState, body: newText} })}
                    index={textareaRef.current?.selectionStart || 0} 
                  />
                </div>
                
                <div
                  className={`w-full rounded-lg border border-transparent p-2 dark:bg-neutral-900`}
                >
                  <textarea
                    ref={textareaRef}
                    value={form.body}
                    onChange={(e) =>
                      setForm({ ...form, body: e.currentTarget.value })
                    }
                    name=""
                    id=""
                    style={{ resize: "vertical" }}
                    className={`${styles.textarea}`}
                    placeholder="Tell the world what you think"
                  />
                </div>
                
                <AnimatePresence>
                {form.body?.length && form.body.length > 0 && 
                  <motion.h2 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className=" text-lg prose dark:prose-invert">Markdown Preview</motion.h2>
                }
                </AnimatePresence>

                <RenderMarkdown content={form.body} />

              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {step == 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="mt-16 flex h-full max-w-3xl flex-col gap-4 p-4 max-sm:w-full"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className=" flex w-full flex-row items-center gap-2 rounded-lg bg-neutral-200 p-4 dark:bg-neutral-800 "
              >
                <motion.span className="material-symbols-outlined dark:text-neutral-400">
                  search
                </motion.span>
                <motion.input
                  type="text"
                  placeholder="Search Communities"
                  onChange={(e) => setCommunitySearch(e.currentTarget.value)}
                  className=" h-full w-full bg-transparent outline-none "
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15, delay: 0.05 }}
                />
              </motion.div>

              <motion.ul
                initial="hidden"
                animate="visible"
                variants={list}
                className="flex w-full flex-col gap-4"
              >
                <InfiniteScroll
                  pageStart={2}
                  loadMore={loadMoreCommunities}
                  hasMore={hasMoreCommunities}
                  className="flex w-full flex-col gap-4"
                >
                  {communities
                    .filter(
                      (c) =>
                        c?.community?.name?.includes(
                          communitySearch.toLocaleLowerCase(),
                        ),
                    )
                    .map((community) => (
                      <motion.div
                        variants={item}
                        key={community?.community?.id}
                        className="border-neutral-700 pb-4 dark:border-b"
                      >
                        <button
                          className="w-full"
                          onClick={() => handleStep1(community)}
                          type="button"
                        >
                          <CommunityCard community={community} />
                        </button>
                      </motion.div>
                    ))}
                  <EndlessScrollingEnd />
                </InfiniteScroll>
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {step == 2 && (
            <motion.form
              id="steptwo"
              onSubmit={(e) => handleStep2(e)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ x: "-500%" }}
              className="mt-16 flex h-full max-w-3xl flex-col gap-4 p-4  max-sm:w-full"
            >
              <div className="flex w-full flex-col items-start justify-between gap-4 ">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex h-fit flex-row gap-2 overflow-visible"
                >
                  <CommunityCard community={selectedCommunity} />
                  <span className="material-symbols-outlined">expand_more</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCommunityRulesPopup(true)}
                  className=" w-fit rounded-lg border border-fuchsia-500 p-2 text-xs font-bold text-fuchsia-500"
                >
                  Community Description
                </button>
              </div>

              <div className="flex w-full flex-row items-center">
                <div className="inline-flex items-center">
                  <div className="mb-4 flex items-center">
                    <input
                      id="NSFW"
                      type="checkbox"
                      value=""
                      checked={form.nsfw}
                      onClick={() => setForm({ ...form, nsfw: !form.nsfw })}
                      className="h-4 w-4 overflow-hidden rounded-lg border-gray-300 bg-neutral-100 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                    />
                    <label
                      htmlFor="NSFW"
                      className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      NSFW
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex w-full flex-row gap-2 overflow-x-auto border-b border-neutral-300 pb-2 dark:text-neutral-500 max-sm:pb-4">
                  <RenderFormattingOptions text="" setText={() => null} index={0} />
                </div>

                <div className="mt-4">
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.currentTarget.value })
                    }
                    type="text"
                    placeholder="An interesting title"
                    className={`${styles.input}`}
                  />
                </div>
                <div>
                  <textarea
                    ref={textareaRef}
                    value={form.body}
                    onChange={(e) =>
                      setForm({ ...form, body: e.currentTarget.value })
                    }
                    name=""
                    id=""
                    style={{ resize: "vertical" }}
                    className={`${styles.textarea}`}
                    placeholder="Tell the world what you think"
                  />
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {communityRulesPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-0 top-0 flex min-h-screen min-w-full justify-center rounded-lg backdrop-blur-lg dark:bg-neutral-950/75"
            >
              <div className="relative flex h-full w-fit flex-col justify-center gap-1 p-6 pt-20">
                <button
                  onClick={() => setCommunityRulesPopup(false)}
                  className="flex items-center justify-center"
                >
                  <span className="material-symbols-outlined absolute left-10 top-10">
                    close
                  </span>
                </button>
                <span className="text-xl font-bold">
                  {selectedCommunity?.community?.title}
                </span>
                <RenderMarkdown
                  content={selectedCommunity?.community?.description}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
