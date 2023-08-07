"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CaptchaResponse } from "lemmy-js-client";
import va from "@vercel/analytics";
import { Input, Button, Checkbox } from "@nextui-org/react";

import { register, getCaptcha, getCuratedInstances } from "@/utils/lemmy";
import { saveAccount, handleLogin, getUserData } from "@/utils/authFunctions";
import { FormatNumber } from "@/utils/helpers";

import {
  validateUsername,
  validatePassword,
  verifyASCII,
  validatePasswordStrong,
} from "@/utils/regex";

import Logo from "@/components/Logo";

import { defaultState, useSession } from "@/hooks/auth";

import styles from "@/styles/Pages/LoginPage.module.css";

interface CuratedInstance {
  // Instance hostname
  Instance: string;
  // New Users
  NU: "Yes" | "No";
  // New Community
  NC: "Yes" | "No";
  // Federated with others
  Fed: "Yes" | "No";
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
  const url = matches![0]
    .replace("(", "")
    .replace(")", "")
    .replace("https://", "");
  return url;
};

export default function Register() {
  const [form, setForm] = useState<{
    username: string;
    email: string;
    password: string;
    saveLogin: boolean;
    showNSFW: boolean;
    instance: string;
    captcha: string;
  }>({} as any);
  const { session, setSession } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [curatedInstances, setCuratedInstances] = useState<CuratedInstance[]>(
    [],
  );
  const [selectedInstance, setSelectedInstance] =
    useState<CuratedInstance | null>(null);
  const [filteredInstances, setFilteredInstances] = useState<CuratedInstance[]>(
    [],
  );

  const [step, setStep] = useState<number>(0);

  const [badPassword, setBadPassword] = useState<boolean>(false);
  const [badUsername, setBadUsername] = useState<boolean>(false);
  const [signupError, setSignupError] = useState<boolean>(false);

  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [passwordStrengthText, setPasswordStrengthText] = useState<string>("");

  const [passwordHintText, setPasswordHintText] = useState<string>("");
  const [passwordErrorText, setPasswordErrorText] = useState<string>("");
  const [usernameErrorText, setUsernameErrorText] = useState<string>("");
  const [emailErrorText, setEmailErrorText] = useState<string>("");

  const [signupComplete, setSignupComplete] = useState<boolean>(false);

  const [captcha, setCaptcha] = useState<CaptchaResponse>(
    {} as CaptchaResponse,
  );

  const [hasVerficationEmail, setHasVerificationEmail] =
    useState<boolean>(false);

  // check password strength
  useEffect(() => {
    const email = form.email,
      password = form.password;

    if (form.username) {
      if (form.username.length == 0) {
        setUsernameErrorText("");
        return;
      }
      const isUsernameASCII = verifyASCII(form.username);
      const isUsernameValid = validateUsername(form.username);
      const isUsernameShort = form.username.length < 3;
      const isUsernameLong = form.username.length > 21;

      if (isUsernameShort)
        setUsernameErrorText("Username must be at least 3 characters long");
      else if (!isUsernameASCII) setUsernameErrorText("Username must be ASCII");
      else if (!isUsernameValid)
        setUsernameErrorText(
          "Username can only have lowercase letters and underscores.",
        );
      else if (isUsernameLong)
        setUsernameErrorText("Username can't be longer than 21 characters");
      else setUsernameErrorText("");
    }

    if (password) {
      if (password.length == 0) {
        setPasswordErrorText("");
        return;
      }
      const isPasswordValid = validatePassword(password);
      const isStrongPassword = validatePasswordStrong(password);
      const isPasswordShort = password.length < 8;
      const isPasswordLong = password.length > 10;

      if (!isPasswordValid)
        setPasswordErrorText(
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        );
      if (isPasswordShort)
        setPasswordErrorText("Password must be at least 8 characters long");

      if (isPasswordValid) {
        setPasswordErrorText("");
        setPasswordStrength(100);
      }

      if (isPasswordLong && isPasswordValid) {
        setPasswordStrength(91);
      }

      if (isPasswordValid && !isStrongPassword) {
        setPasswordHintText(
          "A very strong password contains at least 15 characters, no consecutive characters, 2 lower-, 2 uppwer, 2 specialcharacters, and 2 numbers.",
        );
        setPasswordStrength(100);
      }
    }

    if (email) {
      if (email.length == 0) {
        setEmailErrorText("");
        return;
      }
      const isEmailASCII = verifyASCII(email);
      if (!isEmailASCII) setEmailErrorText("Email must be ASCII");
    }
  }, [form]);

  useEffect(() => {
    getCuratedInstances().then((res) => {
      if (!res) return console.error("Could not get federated instances");
      setCuratedInstances(res);
    });
  }, []);

  useEffect(() => {
    if (passwordStrength < 10) {
      setPasswordStrengthText("Weak");
    } else if (passwordStrength > 50 && passwordStrength < 90) {
      setPasswordStrengthText("Good");
    } else if (passwordStrength > 90 && passwordStrength != 100) {
      setPasswordStrengthText("Strong");
    } else if (passwordStrength == 100) {
      setPasswordStrengthText("Very strong");
    }
  }, [passwordStrength]);

  const validateForm = (): boolean => {
    const email = form.email,
      password = form.password,
      username = form.username,
      show_nsfw = form.showNSFW;
    if (
      email &&
      password &&
      username &&
      show_nsfw &&
      verifyASCII(email) &&
      verifyASCII(username) &&
      validateUsername(username) &&
      validatePassword(password)
    )
      return true;
    return false;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const isValid = validateForm();
    if (!isValid) return;
    if (!form.captcha || !form.instance) return;

    va.track("signup", { instance: form.instance });

    const res = await register(
      {
        username: form.username,
        password: form.password,
        password_verify: form.password,
        email: form.email,
        show_nsfw: form.showNSFW,
        captcha_uuid: captcha.uuid,
        captcha_answer: form.captcha,
      },
      form.instance,
    );

    // Not used right now => Always sets a cookie
    const saveLogin = form.saveLogin;

    // Failed to register handling
    if (!res || !res.jwt) {
      const error = res as unknown as any;
      error?.error && alert(error.error);
      setSignupError(true);
      setLoading(false);
      return;
    }

    const user = await getUserData(form.instance, res.jwt);

    if (!user) {
      alert("Could not get user data");
      setLoading(false);
      va.track("error", { instance: form.instance });
      return;
    }

    // Add cookie
    await handleLogin({
      session: session,
      setSession: setSession,
      router: router,
      accountWithSite: {
        username: form.username,
        instance: form.instance,
        jwt: res.jwt,
        user: user.my_user!.local_user_view,
        site: user,
        settings: defaultState.settings,
      },
    });

    // Not all instances send emails
    if (res.verify_email_sent) {
      setHasVerificationEmail(true);
    }

    setLoading(false);
    setSignupComplete(true);
  };

  const handleStep0 = async (e: FormEvent) => {
    e.preventDefault();

    // validate everything
    const isValid = validateForm();
    //if(!isValid) return alert("Please fill out all fields correctly.");

    setStep(1);
  };

  useEffect(() => {
    const filtered = curatedInstances
      ?.filter(
        (instance) =>
          instance?.Instance?.includes(form?.instance) &&
          instance?.NU == "Yes" &&
          instance?.NC == "Yes" &&
          instance?.Fed == "Yes",
      )
      .slice(0, 5);
    setFilteredInstances(filtered);
  }, [form.instance, curatedInstances]);

  // Load captcha from instance
  useEffect(() => {
    form.instance &&
      selectedInstance?.Instance &&
      getCaptcha({}, form.instance).then((res) => {
        if (!res || !res.ok) return;

        setCaptcha(res.ok);
      });
  }, [form.instance, selectedInstance?.Instance]);

  return (
    <div className=" flex min-h-screen w-screen justify-center">
      <div className="flex h-full max-w-3xl flex-col items-center justify-between gap-24 pt-16 max-md:w-full ">
        {/* Add basic info */}
        <AnimatePresence mode="popLayout">
          {step == 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex flex-col items-center"
            >
              <Logo />

              <div className="flex max-w-3xl flex-col items-center justify-center gap-4 max-sm:w-full">
                <h1 className="text-3xl font-bold max-sm:text-center max-sm:text-xl">
                  Welcome to Nemmy
                </h1>

                <form
                  onSubmit={(e) => handleStep0(e)}
                  className={`${styles.loginWrapper}`}
                >
                  <Input
                    label="Username"
                    variant="bordered"
                    color="primary"
                    required
                    disabled={loading}
                    labelPlacement="inside"
                    value={form.username || ""}
                    onChange={(e) =>
                      setForm({ ...form, username: e.currentTarget.value })
                    }
                    errorMessage={
                      form.username?.length > 0 && usernameErrorText
                    }
                  />

                  <Input
                    label="Email"
                    variant="bordered"
                    color="primary"
                    required
                    disabled={loading}
                    type="email"
                    labelPlacement="inside"
                    value={form.email || ""}
                    onChange={(e) =>
                      setForm({ ...form, email: e.currentTarget.value })
                    }
                    errorMessage={form.email?.length > 0 && emailErrorText}
                  />

                  <Input
                    label="Password"
                    variant="bordered"
                    color={
                      form.password?.length > 0 && passwordStrength < 10
                        ? "danger"
                        : "primary"
                    }
                    required
                    disabled={loading}
                    labelPlacement="inside"
                    type={isPasswordVisible ? "text" : "password"}
                    defaultValue={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.currentTarget.value })
                    }
                    errorMessage={
                      form.password?.length > 0 && passwordStrengthText
                    }
                    endContent={
                      <Button
                        variant="light"
                        isIconOnly
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      >
                        <span className="material-symbols-outlined">
                          {isPasswordVisible ? "visibility_off" : "visibility"}
                        </span>
                      </Button>
                    }
                  />

                  <Checkbox isSelected={form.showNSFW}>
                    Show NSFW Content
                  </Checkbox>
                  <Checkbox
                    isSelected={form.saveLogin}
                    defaultChecked
                    isDisabled
                  >
                    Save login
                  </Checkbox>
                  <span className="text-xs text-neutral-700 dark:text-neutral-400">
                    Temporary login is not support currently.
                  </span>

                  <button
                    className={`${styles.button} ${styles.primary}`}
                    type="submit"
                  >
                    Next step
                  </button>
                  <Link className="a" href="/auth/login">
                    Or sign in
                  </Link>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Choose instance */}
        <AnimatePresence mode="popLayout">
          {step == 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex w-full flex-col p-4"
            >
              <div className="flex h-full w-full flex-col justify-between gap-4">
                <div className="flex h-fit flex-row items-center gap-4">
                  <button
                    onClick={() => setStep(0)}
                    className="flex items-center"
                  >
                    <span className="material-symbols-outlined">
                      arrow_back
                    </span>
                  </button>

                  <h1 className="text-xl font-bold max-sm:text-center">
                    Choose your instance
                  </h1>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setStep(2);
                  }}
                  className={`${styles.loginWrapper} w-full`}
                >
                  <div className={`${styles.inputWrapper} relative w-full`}>
                    <Input
                      label="Instance"
                      variant="bordered"
                      color="primary"
                      required
                      disabled={loading}
                      labelPlacement="inside"
                      value={form.instance || ""}
                      onChange={(e) => {
                        setForm({ ...form, instance: e.currentTarget.value });
                        setSelectedInstance(null);
                      }}
                    />

                    {filteredInstances.length > 0 &&
                      !selectedInstance?.Instance &&
                      form?.instance?.length > 3 && (
                        <div
                          className=" absolute left-1/2 z-30 flex w-full flex-col gap-2 rounded-lg border p-4 pt-2 backdrop-blur-3xl dark:border-fuchsia-800 dark:bg-neutral-950/50"
                          style={{
                            bottom: "-10%",
                            transform: "translateX(-50%) translateY(100%)",
                          }}
                        >
                          {form?.instance?.length > 0 &&
                            filteredInstances.map((instance, i) => (
                              <div
                                key={i}
                                onClick={() => {
                                  setForm({
                                    ...form,
                                    instance: getHostnameFromMarkdownLink(
                                      instance?.Instance,
                                    ),
                                  });
                                  setSelectedInstance(instance);
                                }}
                                className="flex w-full cursor-pointer flex-col items-center gap-2 border-b p-2 dark:border-fuchsia-800"
                              >
                                <div className="flex w-full flex-row items-center gap-2">
                                  <span className="w-full overflow-hidden text-ellipsis text-sm font-bold max-sm:text-lg ">
                                    {getHostnameFromMarkdownLink(
                                      instance?.Instance,
                                    )}
                                  </span>
                                </div>
                                <div className="flex w-full flex-row items-center gap-2">
                                  <span className="snack text-xs">
                                    {FormatNumber(instance.Users, true)}
                                    <span className="material-symbols-outlined">
                                      person
                                    </span>
                                  </span>
                                  {instance.Adult == "Yes" && (
                                    <span className="text-xs text-red-50">
                                      NSFW
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                  </div>

                  <button
                    className={`${styles.button} ${styles.primary}`}
                    type="submit"
                  >
                    Next step
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Review info */}
        <AnimatePresence mode="popLayout">
          {step == 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex w-full flex-col p-4"
            >
              <div className="flex h-full w-full flex-col justify-between gap-4">
                <div className="flex h-fit flex-row items-center gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center"
                  >
                    <span className="material-symbols-outlined">
                      arrow_back
                    </span>
                  </button>

                  <h1 className="text-xl font-bold">Review your info</h1>
                </div>

                <form
                  onSubmit={(e) => handleSubmit(e)}
                  className={`${styles.loginWrapper} w-full`}
                >
                  <Input
                    label="Username"
                    variant="bordered"
                    color="primary"
                    required
                    disabled={loading}
                    labelPlacement="inside"
                    value={form.username || ""}
                    onChange={(e) =>
                      setForm({ ...form, username: e.currentTarget.value })
                    }
                    errorMessage={
                      form.username?.length > 0 && usernameErrorText
                    }
                  />

                  <Input
                    label="Email"
                    variant="bordered"
                    color="primary"
                    required
                    disabled={loading}
                    type="email"
                    labelPlacement="inside"
                    value={form.email || ""}
                    onChange={(e) =>
                      setForm({ ...form, email: e.currentTarget.value })
                    }
                    errorMessage={form.email?.length > 0 && emailErrorText}
                  />

                  <Input
                    label="Password"
                    variant="bordered"
                    color={
                      form.password?.length > 0 && passwordStrength < 10
                        ? "danger"
                        : "primary"
                    }
                    required
                    disabled={loading}
                    labelPlacement="inside"
                    type={isPasswordVisible ? "text" : "password"}
                    defaultValue={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.currentTarget.value })
                    }
                    errorMessage={
                      form.password?.length > 0 && passwordStrengthText
                    }
                    endContent={
                      <Button
                        variant="light"
                        isIconOnly
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      >
                        <span className="material-symbols-outlined">
                          {isPasswordVisible ? "visibility_off" : "visibility"}
                        </span>
                      </Button>
                    }
                  />

                  <Checkbox isSelected={form.showNSFW}>
                    Show NSFW Content
                  </Checkbox>
                  <Checkbox
                    isSelected={form.saveLogin}
                    defaultChecked
                    isDisabled
                  >
                    Save login
                  </Checkbox>
                  <span className="text-xs text-neutral-700 dark:text-neutral-400">
                    Temporary login is not support currently.
                  </span>

                  <Input
                    label="Instsance"
                    labelPlacement="inside"
                    variant="bordered"
                    color="primary"
                    required
                    disabled={loading}
                    value={form.instance || ""}
                    onChange={(e) =>
                      setForm({ ...form, instance: e.currentTarget.value })
                    }
                  />

                  <div className="flex flex-col">
                    <div className="flex flex-col gap-2">
                      <img
                        src={`data:image/png;base64,${captcha.png}`}
                        className=" h-auto w-full rounded-lg object-contain"
                        alt=""
                      />

                      <Input
                        label="Captcha"
                        labelPlacement="inside"
                        variant="bordered"
                        color="primary"
                        required
                        disabled={loading}
                        value={form.captcha || ""}
                        onChange={(e) =>
                          setForm({ ...form, captcha: e.currentTarget.value })
                        }
                      />
                    </div>
                  </div>

                  <button
                    className={`${styles.button} ${styles.primary}`}
                    type="submit"
                  >
                    Sign up
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Signup complete */}
      <AnimatePresence>
        {signupComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className=" fixed left-0 top-0 flex min-h-screen w-full flex-col items-center justify-center gap-2 p-6 backdrop-blur-3xl dark:bg-neutral-950/50 "
          >
            <span
              className="material-symbols-outlined text-fuchsia-500"
              style={{ fontSize: "10rem" }}
            >
              check_circle
            </span>
            <span className="text-center font-bold">
              {hasVerficationEmail
                ? "Check your Email for the verification link"
                : "Thank you for signing up to " + form.instance}
            </span>
            {hasVerficationEmail && (
              <Link href="/" target="_self">
                <button className=" rounded-lg bg-fuchsia-400 p-4 py-2 font-bold text-fuchsia-950 ">
                  Return to home
                </button>
              </Link>
            )}
            {!hasVerficationEmail && (
              <Link href={`u/${form.username}`} target="_self">
                <button className=" rounded-lg bg-fuchsia-400 p-4 py-2 font-bold text-fuchsia-950 ">
                  Go to your user Profile
                </button>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
