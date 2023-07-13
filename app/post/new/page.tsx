"use client"

import { useNavbar } from "@/hooks/navbar"
import { FormEvent, useEffect, useState, useRef } from "react";

import RenderFormattingOptions from "@/components/ui/RenderFormattingOptions";
import { CommunityView, CreatePost, PostResponse } from "lemmy-js-client";
import { AnimatePresence, motion, stagger } from "framer-motion";
import { listCommunities, createPost } from "@/utils/lemmy";
import { useSession } from "@/hooks/auth";
import { useRouter } from "next/navigation";
import RenderMarkdown from "@/components/ui/RenderMarkdown";

import styles from "@/styles/Pages/NewPost.module.css";


function CommunityCard({ community} : { community: CommunityView }) {
    return (
        <div className="flex flex-row gap-2 justify-start items-center h-full w-full transition-all duration-100 dark:hover:translate-y-1 max-md:hover:translate-y-0">
            <img src={community?.community?.icon || "https://i.imgur.com/IN6ZY30.png"} alt="" className="w-8 h-8 rounded-full overflow-hidden object-contain" />
            <div className="flex flex-col items-start h-full justify-center">
                <span className="font-bold">c/{community?.community?.name}</span>
                <span className="text-neutral-400 text-xs">{community?.counts?.subscribers} Subscribers</span>
            </div>
        </div>
    )
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
  }

const item = {
    visible: { opacity: 1, y: 0 },
    hidden: { opacity: 0, y: 100 },
}


export default function New() {
    const { navbar, setNavbar } = useNavbar();
    const { session } = useSession();
    const [form, setForm] = useState<CreatePost>({} as CreatePost)
    const [step, setStep]= useState<number>(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const router = useRouter();

    const [communities, setCommunities] = useState<CommunityView[]>([]);
    const [communitySearch, setCommunitySearch] = useState<string>("");
    const [selectedCommunity, setSelectedCommunity] = useState<CommunityView>({} as CommunityView);
    const [communityRulesPopup, setCommunityRulesPopup] = useState<boolean>(false);

    // Check if user is logged in
    useEffect(() => {
        if(session.jwt.length == 0 && !session.pendingAuth) {
            router.push("/auth");
        };
    }, [session])

    useEffect(() => {
        if(navbar?.hidden) return;

        navbar && setNavbar({
            ...navbar,
            hidden: true
        })
    }, [navbar])

    useEffect(() => {
        listCommunities({ limit: 50, sort: "Hot", type_: "Subscribed", auth: session?.jwt, page: 0 }).then((res) => {
            if(typeof res === "boolean") return console.error("Failed to fetch communities");
            setCommunities(res.communities)
        })
    }, [session.jwt])

    // Adjust textarea height to content on user input
    useEffect(() => {
        const textarea = textareaRef.current;

        function adjustHeight() {
            if(!textarea) return;
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        }

        textarea?.addEventListener("input", adjustHeight);
        adjustHeight();

        // Cleanup on onmount
        return () => {
            textarea?.removeEventListener("input", adjustHeight);
        }

    }, [])

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
    }

    const handleStep0 = (e: FormEvent) => {
        handleSubmit(e);
        setStep(1);
    }

    const handleStep1 = (community: CommunityView) => {
        setForm({ ...form, community_id: community?.community?.id });
        setSelectedCommunity(community);
        setStep(2);
    }

    const handleStep2 = async (e: FormEvent) => {
        handleSubmit(e);
        const res = await createPost({
            name: form.name,
            community_id: form.community_id,
            url: form.url,
            body: form.body,
            nsfw: form.nsfw,
            language_id: form.language_id,
            auth: session.jwt
        });
        
        if(typeof res == "boolean") return alert("Failed to create post");

        const postUrl = res.post_view.post.id;

        router.push("/post/" + postUrl);
        
    }

    const handleClose = () => {
        router.push("/");
    }

    return (
    <div className="flex justify-center">
        <div className={`bg-neutral-50 dark:bg-neutral-950 min-h-screen w-full p-20 max-md:p-0 justify-center items-center flex flex-col `}>
        
        { step == 0 &&
            <AnimatePresence>
                <motion.div  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`${styles.header} justify-between`}>

                    <button onClick={handleClose} className="flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>

                    <button type="submit" form="stepzero" className="text-fuchsia-500 font-bold">Continue</button>

                </motion.div>
            </AnimatePresence>
        }

        { step == 1 &&
            <AnimatePresence>
                <motion.div  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}className={`${styles.header} justify-start`}>

                    <button onClick={() => setStep(0)} className="flex items-center justify-center"><span className="material-symbols-outlined">arrow_back</span></button>

                    <span className="font-bold text-neutral-950 dark:text-neutral-100 text-xl">Select a Community to post in</span>

                </motion.div>
            </AnimatePresence>
        }

        { step == 2 &&
            <AnimatePresence>
                <motion.div  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`${styles.header} justify-between`}>

                    <button  onClick={handleClose} className="flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>

                    <button type="submit" form="steptwo" className="bg-fuchsia-500 text-fuchsia-950 p-2 px-4 rounded-lg font-bold">Post</button>

                </motion.div>
            </AnimatePresence>
        }



        <AnimatePresence  mode="popLayout" >
            {step == 0 && 
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: "-500%" }} className="p-4 flex flex-col gap-4 mt-16 w-full  h-full max-w-3xl">
                    <form id="stepzero" onSubmit={(e) => handleStep0(e)} className="flex flex-col gap-2 w-full">
                        <div className="flex flex-row gap-2 pb-2 w-full border-b border-neutral-300 overflow-x-auto max-sm:pb-4">
                            <RenderFormattingOptions />
                        </div>
                        
                        <div className="mt-4 w-full">
                            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.currentTarget.value })} type="text" placeholder="An interesting title" className={`${styles.input}`} />
                        </div>
                        <div className={`w-full border border-transparent p-2 rounded-lg dark:bg-neutral-900`}>
                            <textarea 
                                ref={textareaRef}
                                value={form.body}
                                onChange={(e) => setForm({ ...form, body: e.currentTarget.value })}
                                name="" id="" style={{ resize: "vertical" }} 
                                className={`${styles.textarea}`} placeholder="Tell the world what you think" />
                        </div>
                    </form>
                </motion.div>
            }
        </AnimatePresence>


        <AnimatePresence mode="popLayout"  >
            { step == 1 && 
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex flex-col gap-4 p-4 mt-16 h-full max-w-3xl" >
                    <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: .25 }}
                    className=" w-full bg-neutral-200 dark:bg-neutral-800 rounded-lg p-4 flex flex-row gap-2 items-center " >
                        <motion.span className="material-symbols-outlined dark:text-neutral-400">search</motion.span>
                        <motion.input 
                            type="text" placeholder="Search Communities"
                            onChange={(e) => setCommunitySearch(e.currentTarget.value)} 
                            className=" bg-transparent h-full w-full outline-none " 
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: .15, delay: 0.05 }}
                            />
                    </motion.div>

                    <motion.ul
                        initial="hidden"
                        animate="visible"
                        variants={list}
                        className="flex flex-col gap-4 w-full">
                       {communities.filter((c) => c?.community?.name?.includes(communitySearch.toLocaleLowerCase())).map((community) => (
                           <motion.li  variants={item} key={community?.community?.id}><button className="w-full" onClick={() => handleStep1(community)} type="button"><CommunityCard community={community} /></button></motion.li>
                          ))}
                    </motion.ul>

                </motion.div>
            }
        </AnimatePresence>

        <AnimatePresence mode="popLayout"  >
            { step == 2 &&
                <motion.form id="steptwo" onSubmit={(e) => handleStep2(e)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ x: "-500%" }} className="p-4 flex flex-col gap-4 mt-16  h-full">
                    <div className="flex flex-col w-full justify-between items-start gap-4 ">
                        <button type="button" onClick={() => setStep(1)} className="flex flex-row gap-2 h-fit overflow-visible">
                            <CommunityCard community={selectedCommunity} />
                            <span className="material-symbols-outlined">expand_more</span>
                        </button>
                        <button type="button" onClick={() => setCommunityRulesPopup(true)} className=" text-fuchsia-500 border border-fuchsia-500 rounded-lg p-2 w-fit font-bold text-xs">Community Description</button>
                    </div>

                    <div className="flex flex-row w-full items-center">

                        <div className="inline-flex items-center">
                        <div className="flex items-center mb-4">
                            <input 
                                id="NSFW" type="checkbox" value="" checked={form.nsfw} onClick={() => setForm({...form, nsfw: !form.nsfw })}
                                className="w-4 h-4 rounded-lg overflow-hidden bg-neutral-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                            <label htmlFor="NSFW" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">NSFW</label>
                        </div>
                        </div>
                    
                    </div>

                    <div  className="flex flex-col gap-2" >
                        <div className="flex flex-row gap-2 pb-2 w-full border-b border-neutral-300 dark:text-neutral-500">
                            <RenderFormattingOptions />
                        </div>
                            
                        <div className="mt-4">
                            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.currentTarget.value })} type="text" placeholder="An interesting title" className={`${styles.input}`} />
                        </div>
                        <div>
                            <textarea 
                                ref={textareaRef}
                                value={form.body}
                                onChange={(e) => setForm({ ...form, body: e.currentTarget.value })}
                                name="" id="" style={{ resize: "vertical" }} 
                                className={`${styles.textarea}`} placeholder="Tell the world what you think" />
                        </div>
                    </div>
                </motion.form>
            }
        </AnimatePresence>


            <AnimatePresence>
                { communityRulesPopup &&
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute flex justify-center top-0 left-0 min-h-screen min-w-full dark:bg-neutral-950/75 backdrop-blur-lg rounded-lg">
                        <div className="relative w-fit h-full p-6 flex justify-center pt-20 flex-col gap-1">
                            <button onClick={() => setCommunityRulesPopup(false)} className="flex items-center justify-center"><span className="material-symbols-outlined absolute top-10 left-10">close</span></button>
                            <span className="font-bold text-xl">{selectedCommunity?.community?.title}</span>
                            <RenderMarkdown>{selectedCommunity?.community?.description}</RenderMarkdown>
                        </div>
                    </motion.div>
                }
            </AnimatePresence>

        </div>
    </div>
    )
}