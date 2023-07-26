"use client"

import { FormEvent, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CreateCommunity, GetSiteResponse } from "lemmy-js-client";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { createCommunity } from "@/utils/lemmy";

import { useSession } from "@/hooks/auth";
import { useNavbar } from "@/hooks/navbar"

import RenderMarkdown from "@/components/ui/RenderMarkdown";
import RenderFormattingOptions from "@/components/ui/RenderFormattingOptions";
import Input from "@/components/ui/Input";

import { DEFAULT_AVATAR } from "@/constants/settings";

import styles from "@/styles/Pages/NewPost.module.css";
import { Account, getAllUserDataFromLocalStorage } from "@/utils/authFunctions";
import { File } from "buffer";



function InstanceCard({ siteResponse, via } : { siteResponse: GetSiteResponse, via?: string }) {
    if(!siteResponse?.site_view?.site) return null;
    return (
        <div className="flex flex-row gap-2 justify-start items-center h-full w-full transition-all duration-100 dark:hover:translate-y-1 max-md:hover:translate-y-0">
            <Image height={32} width={32} src={siteResponse.site_view.site.icon|| DEFAULT_AVATAR} alt="" className="w-8 h-8 rounded-full overflow-hidden object-contain" />
            <div className="flex flex-col items-start h-full justify-center">
                <div className="flex flex-row gap-1 items-center">
                    <span className="font-bold">{siteResponse.site_view.site.name}</span>
                    {via && <span className="text-xs text-neutral-400">via @{via}</span>}
                </div>
                
                <div className="flex flex-row items-center flex-wrap">
                    <span className="text-neutral-400 text-xs">{siteResponse.site_view.counts.users} Users</span>  
                    <div className="dividerDot"></div>
                    <span className="text-neutral-400 text-xs">{siteResponse.site_view.counts.communities} Communities</span>  
                </div>
                
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

function getBufferFromImage(image: File): Promise<( string | ArrayBuffer | null | undefined )> {
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
    const { navbar, setNavbar } = useNavbar();
    const { session } = useSession();
    const [form, setForm] = useState<CreateCommunity>({} as CreateCommunity)
    
    const [step, setStep]= useState<number>(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const router = useRouter();

    const [instances, setInstances] = useState<GetSiteResponse[]>([]);
    const [instance, setInstance] = useState<GetSiteResponse>({} as GetSiteResponse)
    const [instanceSearch, setInstanceSearch] = useState<string>("");

    const [accountToUse, setAccountToUse] = useState<Account>({} as Account);
    const [choosingAccount, setChoosingAccount] = useState<boolean>(false);

    // Check if user is logged in
    useEffect(() => {
        if(!session.currentAccount && !session.pendingAuth) {
            router.push("/auth");
        };
    }, [session, router])

    useEffect(() => {
        if(navbar!.hidden) return;

        navbar && setNavbar({
            ...navbar,
            hidden: true
        })
    }, [navbar, setNavbar])

    // get instances from all logged in user accounts
    useEffect(() => {
        if(session?.accounts?.length == 0) return;
        let instances: GetSiteResponse[] = getAllUserDataFromLocalStorage().map((account) => account.site);
        // dedupe instances
        instances = instances.filter((v,i,a)=>a.findIndex(t=>(t.site_view.site.actor_id === v.site_view.site.actor_id))===i)
        setInstances(instances);
    }, [session.accounts])

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

    // Step 0: Add Basic Info
    const handleStep0 = (e: FormEvent) => {
        e.preventDefault();
        setStep(1);
    }

    // Step 1: Add Sidebar info
    const handleStep1 = (e: FormEvent) => {
        e.preventDefault();
        setStep(2);
    }

    // Add images
    const handleStep2 = async (e: FormEvent) => {
        e.preventDefault();
        setStep(3);
    }

    // Step 3: Select Instance
    const handleStep3 = async (instance: GetSiteResponse) => {
        setInstance(instance);
        setChoosingAccount(true);
    }

    // Choose Account to use for instance
    const handleChooseAccount = async (account: Account) => {
        setAccountToUse(account);
        setChoosingAccount(false);
        setStep(4);
    }

    // Step 4: Final Step
    const handleStep4 = async (e: FormEvent) => {
        e.preventDefault();
        if(!accountToUse.jwt) return alert("You must be logged in to create a Community");

        // Get the account from the instance

        const res = await createCommunity({
            name: form.name,
            title: form.title,
            description: form.description,
            icon: form.icon,
            banner: form.banner,
            nsfw: form.nsfw,
            posting_restricted_to_mods: form.posting_restricted_to_mods,
            discussion_languages: form.discussion_languages,
            auth: accountToUse.jwt,
        }, new URL(instance.site_view.site.actor_id).host);
        
        if(typeof res == "boolean") return alert("Failed to create post");

        const communityUrl = res.community_view.community.name;

        //router.push(`/c/${communityUrl}@${new URL(res.community_view.community.actor_id).host}`);
        
    }

    const handleClose = () => {
        router.push("/");
    }

    return (
    <div className="flex justify-center w-full">
        <div className={`bg-neutral-50 dark:bg-neutral-950 min-h-screen w-full p-20 max-md:p-0 justify-center items-center flex flex-col `}>
        
       {/* 
            Step0: Add Basic Info
            Step1: Add Sidebar info
            Step2: Add Images
            Step3: Select Instance
            Step4: Create Community
       
       */} 

        { step == 0 &&
            <AnimatePresence>
                <motion.div  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`${styles.header} justify-between`}>

                    <button onClick={handleClose} className="flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>

                    <button type="submit" form="stepzero" className="text-fuchsia-500 font-bold">Create a Sidebar</button>

                </motion.div>
            </AnimatePresence>
        }

        { step == 1 &&
            <AnimatePresence>
                <motion.div  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`${styles.header} justify-between`}>

                <button onClick={() => setStep(0)} className="flex items-center justify-center"><span className="material-symbols-outlined">arrow_back</span></button>

                <button type="submit" form="stepone" className="text-fuchsia-500 font-bold">Add Images</button>

                </motion.div>
            </AnimatePresence>
        }

        { step == 2 &&
            <AnimatePresence>
                <motion.div  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`${styles.header} justify-between`}>

                    <button onClick={() => setStep(1)} className="flex items-center justify-center"><span className="material-symbols-outlined">arrow_back</span></button>

                    <button type="submit" form="steptwo" className="text-fuchsia-500 font-bold ">Select an Instance</button>

                </motion.div>
            </AnimatePresence>
        }


        { step == 3 &&
            <AnimatePresence>
                <motion.div  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}className={`${styles.header} justify-start`}>

                    <button onClick={() => setStep(2)} className="flex items-center justify-center"><span className="material-symbols-outlined">arrow_back</span></button>

                    <span className="font-bold text-neutral-950 dark:text-neutral-100 text-xl max-sm:text-xs">Select an Instance for your Community</span>

                </motion.div>
            </AnimatePresence>
        }

        { step == 4 &&
            <AnimatePresence>
                <motion.div  
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                    className={`${styles.header} w-full justify-between`}
                >

                    <button onClick={() => setStep(3)} className="flex items-center justify-center"><span className="material-symbols-outlined">arrow_back</span></button>

                    <span className="font-bold text-neutral-950 dark:text-neutral-100 text-xl max-sm:text-xs w-fit">Finalize your Community</span>

                </motion.div>
            </AnimatePresence>
        }


        {/* Step0: basic info */}
        <AnimatePresence  mode="popLayout" >
            {step == 0 && 
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: "-500%" }} 
                    className="p-4 flex flex-col gap-4 mt-16 w-full  h-full max-w-3xl max-sm:w-full"
                >
                    <form id="stepzero" onSubmit={(e) => handleStep0(e)} className="flex flex-col gap-2 w-full">
                        
                        <div className="w-full flex flex-col">
                            <Input
                                value={form.name || ""}
                                placeholder="CommunityID"
                                onChange={(e: any) => setForm({ ...form, name: e.currentTarget.value })}
                                left={<span className=" text-neutral-500 text-xs font-light ">https://instance.lemmy/c/</span>}
                            />
                            <span className="font-bold text-xs select-none text-neutral-700 dark:text-neutral-300">This cannot be changed afterwards</span>
                        </div>

                        <Input 
                            value={form.title || ""}
                            placeholder="Community Display Name"
                            onChange={(e: any) => setForm({ ...form, title: e.currentTarget.value })}
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
                            onChange={() => setForm({ ...form, posting_restricted_to_mods: !form.posting_restricted_to_mods })}
                            checked={form.posting_restricted_to_mods}
                        />

                    </form>
                </motion.div>
            }
        </AnimatePresence>

        {/* Step1: Sidebar info */}
        <AnimatePresence  mode="popLayout" >
            {step == 1 && 
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: "-500%" }} 
                    className="p-4 flex flex-col gap-4 mt-16 w-full  h-full max-w-3xl max-sm:w-full"
                >
                    <span className="text-xs">This step is optional</span>

                    <form id="stepone" onSubmit={(e) => handleStep1(e)} className="flex flex-col gap-2 w-full">
                        
                        <div className="flex flex-row gap-2 pb-2 w-full border-b border-neutral-300 overflow-x-auto max-sm:pb-4">
                            <RenderFormattingOptions />
                        </div>

                        <div className={`w-full border border-transparent p-2 rounded-lg dark:bg-neutral-900`}>
                            <textarea 
                                ref={textareaRef}
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.currentTarget.value })}
                                name="" id="" style={{ resize: "vertical" }} 
                                className={`${styles.textarea}`} placeholder="Tell the world what you think" />
                        </div>
                    </form>
                </motion.div>
            }
        </AnimatePresence>

        {/* Step2: Add Images */}
        <AnimatePresence  mode="popLayout" >
            {step == 2 && 
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: "-500%" }} 
                    className="p-4 flex flex-col gap-4 mt-16 w-full  h-full max-w-3xl max-sm:w-full"
                >
                    <form id="steptwo" onSubmit={(e) => handleStep2(e)} className="flex flex-col gap-2 w-full">
                        
                        <span className="text-xs">This step is optional</span>

                        <div className="flex flex-col gap-1 dark:bg-neutral-800 p-3 rounded-lg">
                            <span className="font-bold text-xs">Temporary Workaround</span>
                            <div className="flex flex-row flex-wrap text-ellipsis w-full gap-1 max-sm:text-xs">
                                Due to how stupid uploading images to Lemmy is right now. Please upload your pictures to {" "}
                                <Link href={"https://imgur.com"} target="_blank" className="a">imgur</Link>
                                {" "} (or somewhere else) and paste the link here.
                            </div>
                        </div>
                        <Input 
                            type="url"
                            label="Icon"
                            placeholder="https://i.imgur.com/ExGTqMt.png"
                            value={form.icon || ""}
                            onChange={(e: any) => setForm({ ...form, icon: e.currentTarget.value })}
                        />
                        <Input 
                            type="url"
                            label="Banner"
                            placeholder="https://i.imgur.com/ExGTqMt.png"
                            value={form.banner || ""}
                            onChange={(e: any) => setForm({ ...form, banner: e.currentTarget.value })}
                        />
                    </form>
                </motion.div>
            }
        </AnimatePresence>

        {/* Step3: Select Instance */}
        <AnimatePresence mode="popLayout"  >
            { step == 3 && 
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex flex-col gap-4 p-4 mt-16 h-full max-w-3xl max-sm:w-full" >
                    <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: .25 }}
                    className=" w-full bg-neutral-200 dark:bg-neutral-800 rounded-lg p-4 flex flex-row gap-2 items-center " >
                        <motion.span className="material-symbols-outlined dark:text-neutral-400">search</motion.span>
                        <motion.input 
                            type="text" placeholder="Search Instances"
                            onChange={(e) => setInstanceSearch(e.currentTarget.value)} 
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
                        className="flex flex-col gap-4 w-full"
                    >
                       {instances
                        .filter((i) => i.site_view.site.actor_id.includes(instanceSearch.toLocaleLowerCase()))
                        .map((instance) => (
                           <motion.li  variants={item} key={instance.site_view.site.actor_id}><button className="w-full" onClick={() => handleStep3(instance)} type="button">
                                <InstanceCard siteResponse={instance} /></button>
                            </motion.li>
                        ))}
                    </motion.ul>

                    { choosingAccount &&
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: .25 }}
                        className=" absolute top-0 left-0 w-full h-full p-5 pt-10 bg-neutral-50/60 backdrop-blur-xl"
                    >
                        <div className="flex flex-col justify-center items-center">
                            <span className="text-xs">You have multiple Accounts linked to this intance</span>
                            <span className="font-bold text-xs">Please choose the Account to use</span>  
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            {session.accounts.map((account) => (
                                <div 
                                    key={account.username} 
                                    onClick={() => handleChooseAccount(account)}
                                    className={`${styles.wrapper} cursor-pointer flex-wrap relative overflow-hidden items-center border-b border-neutral-300 pb-2 `} >
                                    <div className="absolute top-0 left-0 w-full h-full bg-neutral-950/10 backdrop-blur-xl z-20"></div>
                                    <div id="bgBanner" className="absolute top-0 left-0 w-full h-full z-10" >
                                        <img src={account.user.person.banner || ""} />
                                    </div>
                                    <img src={account.user.person.avatar || DEFAULT_AVATAR } className=" overflow-hidden w-16 h-16 object-cover relative z-30" style={{ borderRadius: "50%" }} alt="" />
                                    <div className="flex flex-col relative w-fit h-full z-30">
                                        <span className="text-xl text-neutral-50">{account.user.person.display_name}</span>
                                        <span className="text-xs text-neutral-200">@{account.username}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </motion.div>
                    }

                </motion.div>
            }
        </AnimatePresence>


        {/* Step4: Final Step */}
        <AnimatePresence mode="popLayout"  >
            { step == 4 &&
                <motion.form 
                    id="stepthree" onSubmit={(e) => handleStep4(e)} 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ x: "-500%" }} 
                    className="p-4 flex flex-col gap-2 mt-16 h-full max-w-3xl  max-sm:w-full"
                >

                    <div className={`${styles.wrapper} flex-wrap relative overflow-hidden items-center `} >
                        <div className="absolute top-0 left-0 w-full h-full bg-neutral-950/10 backdrop-blur-xl z-20"></div>
                        <div id="bgBanner" className="absolute top-0 left-0 w-full h-full z-10" >
                            <img src={form.banner || ""} />
                        </div>
                        <img src={form.icon || DEFAULT_AVATAR } className=" overflow-hidden w-16 h-16 object-cover relative z-30" style={{ borderRadius: "50%" }} alt="" />
                        <div className="flex flex-col relative w-fit h-full z-30">
                            <span className="text-xl text-neutral-50">{form.title}</span>
                            <span className="text-xs text-neutral-200">{form.name}</span>
                        </div>
                    </div>
                    
                    <div className={`${styles.wrapper}`}>
                        {form.description && <RenderMarkdown content={form.description} />}
                    </div>
                    
                    <Input
                        type="checkbox" label="18+ Community"
                        onChange={() => null}
                        checked={form.nsfw}
                        readonly
                    />

                    <Input
                        type="checkbox" label="Restrict Posting to Mods"
                        onChange={() => null}
                        checked={form.posting_restricted_to_mods}
                        readonly
                    />

                    <div className={`${styles.wrapper} `}>
                        <button type="button" onClick={() => setStep(3)} className="flex flex-row gap-2 h-fit overflow-visible">
                            <InstanceCard siteResponse={instance} via={accountToUse.username} />
                        </button>
                    </div>

                    <button className=" w-full rounded-3xl bg-fuchsia-200 text-fuchsia-900 py-4">Create Community</button>

                </motion.form>
            }
        </AnimatePresence>

        </div>
    </div>
    )
}