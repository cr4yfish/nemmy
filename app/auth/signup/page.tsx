"use client" 

import { useState, useEffect, FormEvent } from "react"
import { useSession } from "@/hooks/auth"
import Logo from "@/components/Logo"
import { useRouter } from "next/navigation"
import { useNavbar } from "@/hooks/navbar"
import Link from "next/link"
import { validateUsername, validatePassword, verifyASCII, validatePasswordStrong } from "@/utils/regex"
import { getUserDetails, register, getCaptcha, getCuratedInstances } from "@/utils/lemmy"
import { setCookie } from "cookies-next"
import { motion, AnimatePresence } from "framer-motion"
import { setCookies } from "@/utils/authFunctions"
import { DEFAULT_INSTANCE } from "@/constants/settings";

import styles from "@/styles/Pages/LoginPage.module.css"
import { CaptchaResponse } from "lemmy-js-client"

interface CuratedInstance {
    // Instance hostname
    Instance: string;
    // New Users
    NU: "Yes" | "No";
    // New Community
    NC: "Yes" | "No";
    // Federated with others
    Fed: "Yes" | "No"
    // No filter for NSFW content
    Adult: "Yes" | "No";
    // Allows downvotes
    "↓V": "Yes" | "No";
    // Active users this month
    Users: number;
    // Number of instances that this instance blocks
    BI: number;
    // Number of instances that this instance is blocked by
    BB: number;
    // Percent of Uptime
    UT: number;
    // Version
    Version: string;

}

const getHostnameFromMarkdownLink = (markdown: string) => {
    // [Lemmy](https://lemmy.ml)
    const regex = /\((.*?)\)/g;
    const matches = regex.exec(markdown);

    // replace the parentheses
    const url = matches![0].replace("(", "").replace(")", "").replace("https://", "");
    return url;
}

export default function Register() {
    const [form, setForm] = useState<{ username: string, email: string, password: string, saveLogin: boolean, showNSFW: boolean, instance: string, captcha: string}>({} as any)
    const { session, setSession } = useSession()
    const router = useRouter()
    const { navbar, setNavbar } = useNavbar()
    const [loading, setLoading] = useState<boolean>(false);
    const [curatedInstances, setCuratedInstances] = useState<CuratedInstance[]>([]);
    const [selectedInstance, setSelectedInstance] = useState<CuratedInstance | null>(null);
    const [filteredInstances, setFilteredInstances] = useState<CuratedInstance[]>([]);

    const [step, setStep] = useState<number>(0)

    const [badPassword, setBadPassword] = useState<boolean>(false)
    const [badUsername, setBadUsername] = useState<boolean>(false)
    const [signupError, setSignupError] = useState<boolean>(false)

    const [passwordStrength, setPasswordStrength] = useState<number>(0)

    const [passwordHintText, setPasswordHintText] = useState<string>("");
    const [passwordErrorText, setPasswordErrorText] = useState<string>("")
    const [usernameErrorText, setUsernameErrorText] = useState<string>("")
    const [emailErrorText, setEmailErrorText] = useState<string>("")

    const [signupComplete, setSignupComplete] = useState<boolean>(false)

    const [captcha, setCaptcha] = useState<CaptchaResponse>({} as CaptchaResponse)
    
    const [hasVerficationEmail, setHasVerificationEmail] = useState<boolean>(false)

    useEffect(() => {
        setNavbar({ ...navbar!, hidden: true })
    }, [])

    useEffect(() => {

    }, [])

    // check password strength
    useEffect(() => {
        console.log(form);
        const email = form.email, password = form.password;

        if(form.username) {
            if(form.username.length == 0) {
                setUsernameErrorText("")
                return;
            }
            console.log("username", form.username, form.username.length, form.username.length < 3)
            const isUsernameASCII = verifyASCII(form.username);
            const isUsernameValid = validateUsername(form.username);
            const isUsernameShort = form.username.length < 3;
            const isUsernameLong = form.username.length > 21;

            if (isUsernameShort) setUsernameErrorText("Username must be at least 3 characters long");
            else if (!isUsernameASCII) setUsernameErrorText("Username must be ASCII");
            else if (!isUsernameValid) setUsernameErrorText("Username can only have lowercase letters and underscores.");
            else if (isUsernameLong) setUsernameErrorText("Username can't be longer than 21 characters");
            else setUsernameErrorText("");
        }

        if(password) {
            if(password.length == 0) {
                setPasswordErrorText("");
                return
            }
            const isPasswordValid = validatePassword(password);
            const isStrongPassword = validatePasswordStrong(password);
            const isPasswordShort = password.length < 8;
            const isPasswordLong = password.length > 10;

            if (!isPasswordValid) setPasswordErrorText("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
            if (isPasswordShort) setPasswordErrorText("Password must be at least 8 characters long");

            if(isPasswordValid) {
                setPasswordErrorText("");
                setPasswordStrength(100);
            }

            if(isPasswordLong && isPasswordValid) {
                setPasswordStrength(91);
            }

            if(isPasswordValid && !isStrongPassword) {
                setPasswordHintText("A very strong password contains at least 15 characters, no consecutive characters, 2 lower-, 2 uppwer, 2 specialcharacters, and 2 numbers.");
                setPasswordStrength(100);
            } 
        }

        if(email) {
            if(email.length == 0) {
                setEmailErrorText("");
                return
            }
            const isEmailASCII = verifyASCII(email);
            if (!isEmailASCII) setEmailErrorText("Email must be ASCII");
        }

    }, [form])

    useEffect(() => {
        getCuratedInstances().then(res => {
            if(!res) return console.error("Could not get federated instances");
            console.log(res)
            setCuratedInstances(res);
        })
    }, [])

    const validateForm = () : boolean => {
        const email = form.email, password = form.password, username = form.username, show_nsfw = form.showNSFW;
        if(email && password && username && show_nsfw && verifyASCII(email) && verifyASCII(username) && validateUsername(username) && validatePassword(password)) return true;
        return false;
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const isValid = validateForm();
        if(!isValid) return;
        if(!form.captcha || !form.instance) return;

        const res = await register({
            username: form.username,
            password: form.password,
            password_verify: form.password,
            email: form.email,
            show_nsfw: form.showNSFW,
            captcha_uuid: captcha.uuid,
            captcha_answer: form.captcha
        }, form.instance);

        console.log(res);

        const saveLogin = form.saveLogin;

        if(!res || !res.jwt) {
            const error = res as unknown as any
            error?.error && alert(error.error);
            setSignupError(true);
            setLoading(false);
            return;
        }

        setCookies(res.jwt, form.instance);
        
        if(res.verify_email_sent) {
            setHasVerificationEmail(true);
        }

        setLoading(false);
        setSignupComplete(true);
    }

    const handleStep0 = async (e: FormEvent) => {
        e.preventDefault();

        // validate everything
        const isValid = validateForm();
        //if(!isValid) return alert("Please fill out all fields correctly.");

        setStep(1);
    }

    useEffect(() => {
        const filtered = curatedInstances?.filter((instance) => 
        instance?.Instance?.includes(form?.instance) &&
        instance?.NU == "Yes" && instance?.NC == "Yes" &&
        instance?.Fed == "Yes"
        ).slice(0,5);
        setFilteredInstances(filtered);
    }, [form.instance, curatedInstances])


    // Load captcha from instance
    useEffect(() => {
        form.instance && selectedInstance?.Instance && getCaptcha({}, form.instance).then(res => {
            console.log("Captcha:",res)
            if(!res || !res.ok) return;

            setCaptcha(res.ok);
        })
    }, [form.instance, selectedInstance?.Instance])

    return (
        <div className=" w-screen min-h-screen flex justify-center">
        <div className="flex flex-col items-center justify-between pt-16 gap-24 h-full max-w-3xl max-md:w-full ">

            <AnimatePresence mode="popLayout">
            {step == 0 &&
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex flex-col items-center"
            >
            
            <Logo />

            <div className="flex flex-col items-center justify-center gap-4 max-w-3xl max-sm:w-full">
                <h1 className="font-bold text-3xl max-sm:text-xl max-sm:text-center">Welcome to Nemmy</h1>

                <form onSubmit={(e) => handleStep0(e)} className={`${styles.loginWrapper}`}>

                    <div className={`${styles.inputWrapper}`}>
                        <label htmlFor="username">Username</label>
                        <input 
                            placeholder="cool_username" className={`${(badUsername || signupError) ? styles.inputError : styles.input} `} 
                            type="text" id="username" name="username"  
                            onChange={(e) => setForm({...form, username: e.currentTarget.value})}
                            />
                        <span className="text-xs text-red-500 font-bold">{usernameErrorText}</span>
                    </div>

                    <div className={`${styles.inputWrapper}`}>
                        <label htmlFor="">Email</label>
                        <input 
                            placeholder="your@email.com" className={`${styles.input}`}  
                            onChange={(e) => setForm({...form, email: e.currentTarget.value})}
                             disabled={loading} type="email" />
                        <span className="text-xs text-red-500 font-bold">{emailErrorText}</span>
                    </div>

                    <div className={`${styles.inputWrapper}`}>
                        <label htmlFor="">Password</label>
                        <span 
                            className={`text-xs font-bold ${passwordStrength < 10 && styles.weakPassword} ${passwordStrength > 50 && styles.passwordOk} ${passwordStrength > 90 && styles.passwordGood} ${passwordStrength == 100 && styles.passwordUltimate}`}>
                                {form?.password?.length > 0 && passwordStrength < 10 && "Weak"} {passwordStrength > 50 && passwordStrength < 90 && "Good"} {passwordStrength > 90 && passwordStrength != 100 && "Strong"} {passwordStrength == 100 && "Very strong"}
                            </span>
                        <input 
                            placeholder="Subduing-Gnarly-Overarch" className={`${(badPassword || signupError) ?  styles.inputError: styles.input}`} 
                            onChange={(e) => setForm({...form, password: e.currentTarget.value})}
                             disabled={loading} type="password" />
                        <span className="text-xs text-red-500 font-bold">{passwordErrorText}</span>
                    </div>


                    <div className={`flex flex-row gap-3 items-center select-none cursor-pointer`}>
                        <input onChange={() => setForm({...form, showNSFW: !form.showNSFW})} className="w-fit cursor-pointer" disabled={loading} type="checkbox" id="showNSFW" checked={form.showNSFW} />
                        <label className="w-fit cursor-pointer" htmlFor="">Show NSFW Content</label>
                    </div>

                    <div className={`flex flex-row gap-3 items-center select-none`}>
                        <input onChange={() => setForm({...form, saveLogin: !form.saveLogin})} className="w-fit" type="checkbox" id="saveLogin" checked={form.saveLogin} disabled={loading} />
                        <label className="w-fit" htmlFor="">Save login</label>
                    </div>

                    <button className={`${styles.button} ${styles.primary}`} type="submit">Next step</button>
                    <Link className="a" href="/auth/login" >Or sign in</Link>
                </form>
                
            </div>
            </motion.div>
            }
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
                {step == 1 &&
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col p-4 w-full"
                >
                    <div className="flex flex-col h-full w-full gap-4 justify-between">

                        <div className="flex flex-row gap-4 items-center h-fit">
                            <button onClick={() => setStep(0)} className="flex items-center">
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                        
                            <h1 className="font-bold text-xl max-sm:text-center">Choose your instance</h1>
                        </div>


                        <form onSubmit={(e) => {e.preventDefault(); setStep(2)}} className={`${styles.loginWrapper} w-full`}>
                            
                            <div className={`${styles.inputWrapper} w-full relative`}>
                                <label htmlFor="intance">Instance</label>
                                <input 
                                    placeholder={DEFAULT_INSTANCE} className={`${(signupError) ? styles.inputError : styles.input} w-full`} 
                                    type="text"
                                    onChange={(e) => { setForm({...form, instance: e.currentTarget.value}); setSelectedInstance(null) }}
                                    value={form.instance}
                                />
                                
                                {(filteredInstances.length > 0) && !selectedInstance?.Instance && form?.instance?.length > 3 &&
                                <div className=" absolute left-1/2 flex flex-col gap-2 p-4 pt-2 rounded-lg z-30 dark:bg-neutral-950/50 backdrop-blur-3xl border dark:border-fuchsia-800 w-full" style={{ bottom: "-10%", transform: "translateX(-50%) translateY(100%)" }}>
                                    {form?.instance?.length > 0 && filteredInstances.map((instance, i) => (
                                        <div key={i} onClick={() => {setForm({...form, instance: getHostnameFromMarkdownLink(instance?.Instance)}); setSelectedInstance(instance)}} className="flex flex-col w-full items-center gap-2 p-2 cursor-pointer border-b dark:border-fuchsia-800">
                                            <div className="flex flex-row gap-2 items-center w-full">
                                                <span className="material-symbols-outlined text-fuchsia-500">public</span>
                                                <span className="font-bold text-xl max-sm:text-lg w-full overflow-hidden text-ellipsis ">{getHostnameFromMarkdownLink(instance?.Instance)}</span>
                                            </div>
                                            <div className="flex flex-row gap-2 items-center w-full">
                                                <span className="snack text-xs">{instance.Users} active users</span>
                                                {instance.Adult == "Yes" && <span className="text-red-50 text-xs">NSFW</span>}
                                            </div>
                                        </div>
                                    ))}

                                </div>
                                }
                            </div>

                            <button className={`${styles.button} ${styles.primary}`} type="submit">Next step</button>

                        </form>
                    </div>
                    
                </motion.div>
                
                }
            </AnimatePresence>  

            <AnimatePresence mode="popLayout">
                {step == 2 &&
                    <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col p-4 w-full"
                >
                    <div className="flex flex-col h-full w-full gap-4 justify-between">

                        <div className="flex flex-row gap-4 items-center h-fit">
                            <button onClick={() => setStep(1)} className="flex items-center">
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                        
                            <h1 className="font-bold text-xl">Review your info</h1>
                        </div>


                        <form onSubmit={(e) => handleSubmit(e)} className={`${styles.loginWrapper} w-full`}>
                            
                            <div className={`${styles.inputWrapper}`}>
                                <label >Username</label>
                                <input 
                                    placeholder="cool_username" className={`${(badUsername || signupError) ? styles.inputError : styles.input} `} 
                                    type="text" value={form?.username}
                                    disabled
                                    />
                                <span className="text-xs text-red-500 font-bold">{usernameErrorText}</span>
                            </div>

                            <div className={`${styles.inputWrapper}`}>
                                <label >Email</label>
                                <input 
                                    placeholder="your@email.com" className={`${styles.input}`}  
                                    disabled type="email" value={form?.email} />
                                <span className="text-xs text-red-500 font-bold">{emailErrorText}</span>
                            </div>

                            <div className={`${styles.inputWrapper}`}>
                                <label>Password</label>
                                <span 
                                    className={`text-xs font-bold ${passwordStrength < 10 && styles.weakPassword} ${passwordStrength > 50 && styles.passwordOk} ${passwordStrength > 90 && styles.passwordGood} ${passwordStrength == 100 && styles.passwordUltimate}`}>
                                        {form?.password?.length > 0 && passwordStrength < 10 && "Weak"} {passwordStrength > 50 && passwordStrength < 90 && "Good"} {passwordStrength > 90 && passwordStrength != 100 && "Strong"} {passwordStrength == 100 && "Very strong"}
                                    </span>
                                <input 
                                    placeholder="Subduing-Gnarly-Overarch" className={`${(badPassword || signupError) ?  styles.inputError: styles.input}`}
                                    value={form?.password}
                                    disabled type="password" />
                                <span className="text-xs text-red-500 font-bold">{passwordErrorText}</span>
                            </div>


                            <div className={`flex flex-row gap-3 items-center select-none cursor-pointer`}>
                                <input className="w-fit cursor-pointer" disabled type="checkbox" checked={form.showNSFW} />
                                <label className="w-fit cursor-pointer" >Show NSFW Content</label>
                            </div>

                            <div className={`flex flex-row gap-3 items-center select-none`}>
                                <input onChange={() => setForm({...form, saveLogin: !form.saveLogin})} className="w-fit" type="checkbox" checked={form.saveLogin} disabled />
                                <label className="w-fit" >Save login</label>
                            </div>

                            <div className={`${styles.inputWrapper} w-full relative`}>
                                <label >Instance</label>
                                <input 
                                    placeholder={DEFAULT_INSTANCE} className={`${(signupError) ? styles.inputError : styles.input} w-full`} 
                                    type="text"
                                    disabled
                                    value={form.instance}
                                />
                            
                            </div>

                            <div className="flex flex-col">
                                <div className="flex flex-col gap-2">
                                    <img src={`data:image/png;base64,${captcha.png}`} className=" w-full h-auto object-contain rounded-lg" alt="" />
                                    
                                    <div className={`${styles.inputWrapper}`}>
                                        <label >Captcha</label>
                                        <input 
                                            className={`${styles.input}`}  
                                            onChange={(e) => setForm({...form, captcha: e.target.value})}
                                            type="text"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button className={`${styles.button} ${styles.primary}`} type="submit">Sign up</button>

                        </form>
                    </div>
                    
                </motion.div>
                }
            </AnimatePresence>

        </div>

        <AnimatePresence>
            {signupComplete &&
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className=" fixed flex flex-col p-6 gap-2 items-center justify-center top-0 left-0 w-full min-h-screen backdrop-blur-3xl dark:bg-neutral-950/50 ">
                    <span className="material-symbols-outlined text-fuchsia-500" style={{ fontSize: "10rem" }}>check_circle</span>
                    <span className="font-bold text-center">{hasVerficationEmail ? "Check your Email for the verification link" : "Thank you for signing up to " + form.instance}</span>
                    {hasVerficationEmail && <Link href="/" target="_self"><button className=" rounded-lg p-4 py-2 font-bold bg-fuchsia-400 text-fuchsia-950 ">Return to home</button></Link>}
                    {!hasVerficationEmail && <Link href={`u/${form.username}`} target="_self"><button className=" rounded-lg p-4 py-2 font-bold bg-fuchsia-400 text-fuchsia-950 ">Go to your user Profile</button></Link>}
                </motion.div>
            }
        </AnimatePresence>
        </div>
    )
}