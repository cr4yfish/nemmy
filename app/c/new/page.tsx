"use client";

import { FormEvent, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CreateCommunity, GetSiteResponse } from "lemmy-js-client";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { createCommunity } from "@/utils/lemmy";

import { useSession } from "@/hooks/auth";

import RenderMarkdown from "@/components/ui/RenderMarkdown";
import Input from "@/components/ui/Input";
import MdTextarea from "@/components/ui/MdTextarea";

import { DEFAULT_AVATAR } from "@/constants/settings";

import styles from "@/styles/Pages/NewPost.module.css";
import { Account, getAllUserDataFromLocalStorage } from "@/utils/authFunctions";
import { File } from "buffer";

function InstanceCard({
  siteResponse,
  via,
}: {
  siteResponse: GetSiteResponse;
  via?: string;
}) {
  if (!siteResponse?.site_view?.site) return null;
  return (
    <div className="flex h-full w-full flex-row items-center justify-start gap-2 duration-100 transition-all dark:hover:translate-y-1 max-md:hover:translate-y-0">
      <Image
        height={32}
        width={32}
        src={siteResponse.site_view.site.icon || DEFAULT_AVATAR}
        alt=""
        className="h-8 w-8 overflow-hidden rounded-full object-contain"
      />
      <div className="flex h-full flex-col items-start justify-center">
        <div className="flex flex-row items-center gap-1">
          <span className="font-bold">{siteResponse.site_view.site.name}</span>
          {via && <span className="text-xs text-neutral-400">via @{via}</span>}
        </div>

        <div className="flex flex-row flex-wrap items-center">
          <span className="text-xs text-neutral-400">
            {siteResponse.site_view.counts.users} Users
          </span>
          <div className="dividerDot"></div>
          <span className="text-xs text-neutral-400">
            {siteResponse.site_view.counts.communities} Communities
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

function getBufferFromImage(
  image: File,
): Promise<string | ArrayBuffer | null | undefined> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    let bufferResponse;
    reader.onload = (e) => {
      const buffer = e.target?.result;
      // Use the buffer as needed
      bufferResponse = buffer;
      resolve(bufferResponse);
    };
    reader.readAsArrayBuffer(image as unknown as Blob);
  });
}

export default function New() {
  const { session } = useSession();
  const [form, setForm] = useState<CreateCommunity>({} as CreateCommunity);

  const [step, setStep] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const [instances, setInstances] = useState<GetSiteResponse[]>([]);
  const [instance, setInstance] = useState<GetSiteResponse>(
    {} as GetSiteResponse,
  );
  const [instanceSearch, setInstanceSearch] = useState<string>("");

  const [accountToUse, setAccountToUse] = useState<Account>({} as Account);
  const [choosingAccount, setChoosingAccount] = useState<boolean>(false);

  // Check if user is logged in
  useEffect(() => {
    if (!session.currentAccount && !session.pendingAuth) {
      router.push("/auth");
    }
  }, [session, router]);

  // get instances from all logged in user accounts
  useEffect(() => {
    if (session?.accounts?.length == 0) return;
    let instances: GetSiteResponse[] = getAllUserDataFromLocalStorage().map(
      (account) => account.site,
    );
    // dedupe instances
    instances = instances.filter(
      (v, i, a) =>
        a.findIndex(
          (t) => t.site_view.site.actor_id === v.site_view.site.actor_id,
        ) === i,
    );
    setInstances(instances);
  }, [session.accounts]);

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

  // Step 0: Add Basic Info
  const handleStep0 = (e: FormEvent) => {
    e.preventDefault();
    setStep(1);
  };

  // Step 1: Add Sidebar info
  const handleStep1 = (e: FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  // Add images
  const handleStep2 = async (e: FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  // Step 3: Select Instance
  const handleStep3 = async (instance: GetSiteResponse) => {
    setInstance(instance);
    setChoosingAccount(true);
  };

  // Choose Account to use for instance
  const handleChooseAccount = async (account: Account) => {
    setAccountToUse(account);
    setChoosingAccount(false);
    setStep(4);
  };

  // Step 4: Final Step
  const handleStep4 = async (e: FormEvent) => {
    e.preventDefault();
    if (!accountToUse)
      return alert("You must be logged in to create a Community");

    // Get the account from the instance

    const res = await createCommunity(
      {
        name: form.name,
        title: form.title,
        description: form.description,
        icon: form.icon,
        banner: form.banner,
        nsfw: form.nsfw,
        posting_restricted_to_mods: form.posting_restricted_to_mods,
        discussion_languages: form.discussion_languages,
        auth: accountToUse.instanceAccounts[0]?.jwt || "",
      },
      new URL(instance.site_view.site.actor_id).host,
    );

    if (typeof res == "boolean") return alert("Failed to create post");

    const communityUrl = res.community_view.community.name;

    //router.push(`/c/${communityUrl}@${new URL(res.community_view.community.actor_id).host}`);
  };

  const handleClose = () => {
    router.push("/");
  };

  return (
    <div className="flex w-full justify-center">
      <div
        className={`flex min-h-screen w-full flex-col items-center justify-center bg-neutral-50 p-20 dark:bg-neutral-950 max-md:p-0 `}
      >
        {/* 
            Step0: Add Basic Info
            Step1: Add Sidebar info
            Step2: Add Images
            Step3: Select Instance
            Step4: Create Community
       
       */}

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
                Create a Sidebar
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
              className={`${styles.header} justify-between`}
            >
              <button
                onClick={() => setStep(0)}
                className="flex items-center justify-center"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>

              <button
                type="submit"
                form="stepone"
                className="font-bold text-fuchsia-500"
              >
                Add Images
              </button>
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
                onClick={() => setStep(1)}
                className="flex items-center justify-center"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>

              <button
                type="submit"
                form="steptwo"
                className="font-bold text-fuchsia-500 "
              >
                Select an Instance
              </button>
            </motion.div>
          </AnimatePresence>
        )}

        {step == 3 && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`${styles.header} justify-start`}
            >
              <button
                onClick={() => setStep(2)}
                className="flex items-center justify-center"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>

              <span className="text-xl font-bold text-neutral-950 dark:text-neutral-100 max-sm:text-xs">
                Select an Instance for your Community
              </span>
            </motion.div>
          </AnimatePresence>
        )}

        {step == 4 && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`${styles.header} w-full justify-between`}
            >
              <button
                onClick={() => setStep(3)}
                className="flex items-center justify-center"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>

              <span className="w-fit text-xl font-bold text-neutral-950 dark:text-neutral-100 max-sm:text-xs">
                Finalize your Community
              </span>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Step0: basic info */}
        <AnimatePresence mode="popLayout">
          {step == 0 && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "-100%" }}
              transition={{ bounce: 0.5 }}
              className="mt-16 flex h-full w-full max-w-3xl flex-col  gap-4 p-4 max-sm:w-full"
            >
              <form
                id="stepzero"
                onSubmit={(e) => handleStep0(e)}
                className="flex w-full flex-col gap-2"
              >
                <span className=" text-xl font-bold">Add basic info</span>
                <div className="flex w-full flex-col">
                  <Input
                    value={form.name || ""}
                    required
                    placeholder="CommunityID"
                    onChange={(e: any) =>
                      setForm({ ...form, name: e.currentTarget.value })
                    }
                    left={
                      <span className=" text-xs font-light text-neutral-500 ">
                        https://instance.lemmy/c/
                      </span>
                    }
                  />
                  <span className="select-none text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    This cannot be changed afterwards
                  </span>
                </div>

                <Input
                  value={form.title || ""}
                  required
                  placeholder="Community Display Name"
                  onChange={(e: any) =>
                    setForm({ ...form, title: e.currentTarget.value })
                  }
                />

                <Input
                  label="18+ Community"
                  type="checkbox"
                  onChange={() => setForm({ ...form, nsfw: !form.nsfw })}
                  checked={form.nsfw}
                />

                <Input
                  label="Restrict Posting to Mods"
                  type="checkbox"
                  onChange={() =>
                    setForm({
                      ...form,
                      posting_restricted_to_mods:
                        !form.posting_restricted_to_mods,
                    })
                  }
                  checked={form.posting_restricted_to_mods}
                />
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step1: Sidebar info */}
        <AnimatePresence mode="popLayout">
          {step == 1 && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "-100%" }}
              transition={{ bounce: 0.2 }}
              className="mt-16 flex h-full w-full max-w-3xl flex-col  gap-4 p-4 max-sm:w-full"
            >
              <span className=" text-xl font-bold">Add a description</span>
              <span className="text-xs">This step is optional</span>

              <form
                id="stepone"
                onSubmit={(e) => handleStep1(e)}
                className="flex w-full flex-col gap-2"
              >
                <MdTextarea
                  placeholder="Tell the world what you think"
                  defaultValue={form.description}
                  onChange={(newText) =>
                    setForm((prevState) => {
                      return { ...prevState, description: newText };
                    })
                  }
                />
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step2: Add Images */}
        <AnimatePresence mode="popLayout">
          {step == 2 && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "-100%" }}
              transition={{ bounce: 0.2 }}
              className="mt-16 flex h-full w-full max-w-3xl flex-col  gap-4 p-4 max-sm:w-full"
            >
              <form
                id="steptwo"
                onSubmit={(e) => handleStep2(e)}
                className="flex w-full flex-col gap-2"
              >
                <span className=" text-xl font-bold">Add Images</span>
                <span className="text-xs">This step is optional</span>

                <div className="flex flex-col gap-1 rounded-lg p-3 dark:bg-neutral-800">
                  <span className="text-xs font-bold">
                    Temporary Workaround
                  </span>
                  <div className="flex w-full flex-row flex-wrap gap-1 text-ellipsis max-sm:text-xs">
                    Due to how stupid uploading images to Lemmy is right now.
                    Please upload your pictures to{" "}
                    <Link
                      href={"https://imgur.com"}
                      target="_blank"
                      className="a"
                    >
                      imgur
                    </Link>{" "}
                    (or somewhere else) and paste the link here.
                  </div>
                </div>
                <Input
                  type="url"
                  label="Icon"
                  placeholder="https://i.imgur.com/ExGTqMt.png"
                  value={form.icon || ""}
                  onChange={(e: any) =>
                    setForm({ ...form, icon: e.currentTarget.value })
                  }
                />
                <Input
                  type="url"
                  label="Banner"
                  placeholder="https://i.imgur.com/ExGTqMt.png"
                  value={form.banner || ""}
                  onChange={(e: any) =>
                    setForm({ ...form, banner: e.currentTarget.value })
                  }
                />
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step3: Select Instance */}
        <AnimatePresence mode="popLayout">
          {step == 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="mt-16 flex h-full max-w-3xl flex-col gap-4 p-4 max-sm:w-full"
            >
              <motion.div
                initial={{ opacity: 0, x: "100%" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "-100%" }}
                transition={{ bounce: 0.2 }}
                className=" flex w-full flex-row items-center gap-2 rounded-lg bg-neutral-200 p-4 dark:bg-neutral-800 "
              >
                <motion.span className="material-symbols-outlined dark:text-neutral-400">
                  search
                </motion.span>
                <motion.input
                  type="text"
                  placeholder="Search Instances"
                  onChange={(e) => setInstanceSearch(e.currentTarget.value)}
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
                {instances
                  .filter((i) =>
                    i.site_view.site.actor_id.includes(
                      instanceSearch.toLocaleLowerCase(),
                    ),
                  )
                  .map((instance) => (
                    <motion.li
                      variants={item}
                      key={instance.site_view.site.actor_id}
                    >
                      <button
                        className="w-full"
                        onClick={() => handleStep3(instance)}
                        type="button"
                      >
                        <InstanceCard siteResponse={instance} />
                      </button>
                    </motion.li>
                  ))}
              </motion.ul>

              {choosingAccount && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className=" absolute left-0 top-0 flex h-full w-full flex-col items-center gap-4 bg-neutral-50/60 p-5
                            pt-10 backdrop-blur-lg dark:bg-neutral-950/40"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <button
                      onClick={() => setChoosingAccount(false)}
                      className="flex flex-row items-center gap-1 rounded-xl px-4 py-2 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                      <span className="material-symbols-outlined">close</span>
                      <span>Close</span>
                    </button>
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-xs">
                        You have multiple Accounts linked to this intance
                      </span>
                      <span className="text-xs font-bold">
                        Please choose the Account to use
                      </span>
                    </div>
                  </div>

                  <div className="flex w-full flex-col items-center gap-2">
                    {session.accounts.map((account) => (
                      <div
                        key={account.username}
                        onClick={() => handleChooseAccount(account)}
                        className={`${styles.wrapper} relative max-w-3xl cursor-pointer
                        flex-wrap items-center 
                        overflow-hidden border-b border-neutral-300
                                        border-neutral-500 
                                        bg-neutral-200 p-3 pb-2 text-neutral-950
                                        dark:border dark:bg-neutral-800 dark:text-neutral-100 
                                    `}
                      >
                        <div className="absolute left-0 top-0 z-20 h-full w-full bg-neutral-950/10 backdrop-blur-xl"></div>
                        <div
                          id="bgBanner"
                          className="absolute left-0 top-0 z-10 h-full w-full"
                        >
                          <Image
                            fill
                            src={account.user.person.banner || ""}
                            alt=""
                          />
                        </div>
                        <Image
                          src={account.user.person.avatar || DEFAULT_AVATAR}
                          width={64}
                          height={64}
                          className=" relative z-30 h-16 w-16 overflow-hidden object-cover"
                          style={{ borderRadius: "50%" }}
                          alt=""
                        />
                        <div className="relative z-30 flex w-fit flex-col">
                          <span className="text-xl text-neutral-50">
                            {account.user.person.display_name}
                          </span>
                          <span className="text-xs text-neutral-200">
                            @{account.username}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step4: Final Step */}
        <AnimatePresence mode="popLayout">
          {step == 4 && (
            <motion.form
              id="stepthree"
              onSubmit={(e) => handleStep4(e)}
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "-100%" }}
              transition={{ bounce: 0.2 }}
              className="mt-16 flex h-full w-full max-w-3xl flex-col  gap-4 p-4 max-sm:w-full"
            >
              <div className=" flex w-full flex-col gap-2">
                <div
                  className={`${styles.wrapper} relative w-full flex-wrap
                  items-center overflow-hidden 
                  border-neutral-500 bg-neutral-200 p-3 text-neutral-950 dark:border dark:bg-neutral-800 dark:text-neutral-100 `}
                >
                  <div className="absolute left-0 top-0 z-20 h-full w-full bg-neutral-950/10 backdrop-blur-xl"></div>
                  <div
                    id="bgBanner"
                    className="absolute left-0 top-0 z-10 h-full w-full"
                  >
                    <img src={form.banner || ""} />
                  </div>
                  <img
                    src={form.icon || DEFAULT_AVATAR}
                    className=" relative z-30 h-16 w-16 overflow-hidden object-cover"
                    style={{ borderRadius: "50%" }}
                    alt=""
                  />
                  <div className="relative z-30 flex h-full w-fit flex-col">
                    <span className="text-xl text-neutral-50">
                      {form.title}
                    </span>
                    <span className="text-xs text-neutral-200">
                      {form.name}
                    </span>
                  </div>
                </div>

                {form.description && (
                  <div
                    className={`${styles.wrapper} border-neutral-500 bg-neutral-200 p-3
                  text-neutral-950 dark:border 
                  dark:bg-neutral-800 dark:text-neutral-100`}
                  >
                    <RenderMarkdown content={form.description} />
                  </div>
                )}

                <Input
                  type="checkbox"
                  label="18+ Community"
                  onChange={() => null}
                  checked={form.nsfw}
                  readonly
                />

                <Input
                  type="checkbox"
                  label="Restrict Posting to Mods"
                  onChange={() => null}
                  checked={form.posting_restricted_to_mods}
                  readonly
                />

                <div
                  className={`${styles.wrapper} border-neutral-500 bg-neutral-200 p-3
        text-neutral-950 dark:border 
        dark:bg-neutral-800 dark:text-neutral-100 `}
                >
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex h-fit flex-row gap-2 overflow-visible"
                  >
                    <InstanceCard
                      siteResponse={instance}
                      via={accountToUse.username}
                    />
                  </button>
                </div>

                <button className=" w-full rounded-3xl bg-fuchsia-200 py-4 text-fuchsia-900">
                  Create Community
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
