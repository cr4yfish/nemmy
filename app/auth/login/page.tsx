"use client";

import { GetSiteResponse, PersonView } from "lemmy-js-client";
import { FormEvent, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ClipLoader } from "react-spinners";
import va from "@vercel/analytics"
import { Button, Input } from "@nextui-org/react";

import { defaultState, useSession } from "@/hooks/auth";
import { useNavbar } from "@/hooks/navbar";

import Logo from "@/components/Logo";

import { search, getUserDetails } from "@/utils/lemmy";
import {
  saveAccount,
  getAccounts,
  handleLogin,
  Account,
  AccountWithSiteResponse,
} from "@/utils/authFunctions";

import { DEFAULT_AVATAR } from "@/constants/settings";

import styles from "@/styles/Pages/LoginPage.module.css";
import Image from "next/image";



export default function Login() {
  const { session, setSession } = useSession();
  const { navbar, setNavbar } = useNavbar();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [inputFocus, setInputFocus] = useState<boolean>(false);
  const [users, setUsers] = useState<PersonView[]>([]);
  const [selectedUser, setSelectedUser] = useState<PersonView | null>(null);

  const [loginError, setLoginError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const [searchingUserLoading, setSearchingUserLoading] =
    useState<boolean>(false);

  const [form, setForm] = useState<{
    username: string;
    password: string;
    saveLogin: boolean;
    instance: string;
    totp: string;
  }>({
    username: "",
    password: "",
    saveLogin: false,
    instance: "",
    totp: "",
  });

  useEffect(() => {
    setNavbar({ ...navbar!, hidden: true });
  }, []);

  useEffect(() => {
    if (!selectedUser?.person.name) return;
    setForm((prevState) => {
      return {
        ...prevState,
        username: selectedUser.person.name,
        instance: new URL(selectedUser.person.actor_id).hostname,
      };
    });
  }, [selectedUser]);

  const validateHostname = (value: string) => value.match(/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}$/i);

  const instanceValid = useMemo(() => {
    if (form.instance === "") return undefined;

    return validateHostname(form.instance) ? "valid" : "invalid";
  }, [form.instance]);

  const handleSubmit = async (e: FormEvent) => {
    try {
      e.preventDefault();
      if (loading) return;
      setLoading(true);
      let usernameEle = (e.target as HTMLFormElement).elements[0] as any;
      let passwordEle = (e.target as HTMLFormElement).elements[1] as any;

      let username: string = usernameEle.value;
      let password: string = passwordEle.value;

      const accounts = getAccounts();
      // check if there's an account with the same username and instance
      const hasAccount = accounts.find(
        (account) =>
          account.username == username && account.instance == form.instance,
      );

      // if there's any pair of jwt and session, redirect to home since user is already logged in
      if (hasAccount) {
        setLoading(false);
        alert("You already have this account saved");
        router.push("/");
        return;
      }

      va.track("login", { instance: form.instance })

      // get jwt token
      const jwt = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, instance: form.instance }),
      }).then((res) => res.json());

      // get user details
      const user = await getUserDetails(jwt.jwt, form.instance);

      if (!user.my_user) throw new Error("User not found");

      const accountWithSite: AccountWithSiteResponse = {
        username: form.username,
        instance: form.instance,
        jwt: jwt.jwt,
        user: user.my_user.local_user_view,
        site: user,
        settings: defaultState.settings
      };

      await handleLogin({
        accountWithSite: accountWithSite,
        session: session,
        setSession: setSession,
        router: router,
      });
    } catch (e: any) {
      setLoading(false);
      setLoginError(true);
      va.track("login_error", { instance: form.instance, error: e.message })
      console.error("Got error message:",e.message);
      setErrorMessage(`${e.message}`)
    }
  };

  const getUserDetails = async (jwt: string, baseUrl: string) => {
    const user: GetSiteResponse = await fetch(
      `/api/getSite?auth=${jwt}&baseUrl=${baseUrl}`,
    ).then((res) => res.json());
    return user as GetSiteResponse;
  };

  useEffect(() => {
    setSelectedUser(null);
    const timer = setTimeout(async () => {
      if (form.username.length > 0) await searchUsers(form.username);
    }, 250);

    return () => clearTimeout(timer);
  }, [form.username]);

  const searchUsers = async (query: string) => {
    setSearchingUserLoading(true);
    const data = await search({
      q: query,
      type_: "Users",
      listing_type: "All",
    });
    if (!data) return;
    setUsers(data.users);
    setSearchingUserLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex h-96 flex-col items-center justify-between gap-24 pt-16"
    >
      {!inputFocus && <Logo />}

      <div className="flex flex-col items-center gap-4">
        {!inputFocus && <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-200">Welcome back</h1>}

        <form
          onSubmit={(e) => handleSubmit(e)}  className={`${styles.loginWrapper} text-neutral-900 dark:text-neutral-100 `}>

          <div className="relative">
            <Input 
              label="Username" 
              variant="bordered" 
              color="primary" 
              required
              disabled={loading}
              labelPlacement="inside" 
              defaultValue={form.username}
              onChange={(e) => setForm({ ...form, username: e.currentTarget.value })}
              endContent={
                <ClipLoader
                  color={"#e6b0fa"}
                  size={20}
                  loading={searchingUserLoading}
                  className=""
                />
              }
            />
            {users?.length > 0 && !selectedUser && (
              <div  className="absolute left-0 z-50 flex w-full translate-y-full flex-col gap-4 rounded-lg border border-neutral-300 bg-neutral-100/75 p-4 backdrop-blur-3xl dark:border-neutral-700 dark:bg-neutral-900/90" style={{ bottom: "-10%" }}>
                {users.map((user, i) => (
                  <div
                    onClick={() => setSelectedUser(user)}
                    key={i}
                    className="flex cursor-pointer flex-row items-center gap-3 border-neutral-700 dark:border-b dark:pb-4"
                  >
                    <Image
                      height={40}
                      width={40}
                      src={user.person.avatar || DEFAULT_AVATAR}
                      className="h-10 w-10 overflow-hidden rounded-full object-contain"
                      alt=""
                    />
                    <div className="flex flex-col">
                      <span className="font-bold">
                        {user.person.display_name || user.person.name}
                      </span>
                      <span className="text-xs dark:text-neutral-300">
                        @{new URL(user.person.actor_id).hostname}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Input 
            label="Password" 
            variant="bordered" 
            color="primary" 
            required
            disabled={loading}
            labelPlacement="inside" 
            type={isPasswordVisible ? "text" : "password"}
            defaultValue={form.password}
            onChange={(e) => setForm({ ...form, password: e.currentTarget.value })}
            endContent={
              <Button 
                variant="light"
                isIconOnly
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}><span className="material-symbols-outlined">{isPasswordVisible ? "visibility_off" : "visibility"}</span></Button>
            }
          />

          <Input 
            label="Instance" 
            variant="bordered" 
            required
            disabled={loading}
            labelPlacement="inside" 
            value={form.instance}
            color={instanceValid === "invalid" ? "danger" : form.instance.length > 0 ? "success" : "primary"}
            errorMessage={instanceValid === "invalid" && "Please enter a valid Instance"}
            validationState={instanceValid}
            defaultValue={form.instance || ""}
            onChange={(e) => setForm({ ...form, instance: e.currentTarget.value })}
          />

          <Input 
            label="2FA (optional)" 
            variant="bordered" 
            color="primary" 
            disabled={loading}
            labelPlacement="inside" 
            defaultValue={form.totp}
            onChange={(e) => setForm({ ...form, totp: e.currentTarget.value })}
          />

          {loginError && (
            <div className="text-red-500 text-sm w-full break-words break-all max-w-lg">
              {errorMessage}
              </div>
          )
          }
          <button
            disabled={loading}
            className={`${styles.button} ${styles.primary}`}
            type="submit"
          >
            {loading ? <ClipLoader color={"#e6b0fa"} size={20} /> : "Login"}
          </button>
          <Link className="a" href="/auth/signup">
            Or sign up
          </Link>
        </form>
      </div>
    </motion.div>
  );
}
