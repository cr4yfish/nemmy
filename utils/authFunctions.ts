import { deleteCookie, setCookie, getCookie } from "cookies-next";
import { OptionsType } from "cookies-next/lib/types";
import { SessionState } from "@/hooks/auth";
import { GetSiteResponse, LemmyHttp, LocalUserView } from "lemmy-js-client";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

import { Dispatch, SetStateAction } from "react";

export const cookieName = "accounts";
export const cookieCurrentAccountName = "currentAccount";
export const cookieDefaultAccountName = "defaultAccount";

const defaultCookieSettings: OptionsType = { 
    maxAge: 60 * 60 * 24 * 30, 
    domain: undefined, 
    sameSite: "strict",
    secure: process.env.NODE_ENV == "production"
};

export interface Account {
    jwt: string,
    instance: string,
    username: string,
    user: LocalUserView,
}

export interface AccountWithSiteResponse extends Account {
    site: GetSiteResponse
}

/**
 * Removes the account from the cookie
 * @param { session, setSession, router, account } : { session: any, setSession: Function, router: any, account: Account }
 */
export const handleLogout = async ({ session, setSession, router, account } : { session: any, setSession: Function, router: any, account?: Account }) => {
    if(!account) return;
    const accounts = getAccounts();
    const defaultAccount = getDefaultAccount();
    let wasDefault = false;

    // remove the account from the cookie
    const newAccounts = accounts.filter(acc => acc.username != account.username);
    overrideAccounts(newAccounts);

    // if the account was the default account, remove the default account
    if(defaultAccount && defaultAccount.username == account.username) {
        deleteCookie(cookieDefaultAccountName);
        wasDefault = true;
    }

    // if the account was the current account, remove the current account
    // Note: This should always be true since you can't log out of an account that is not the current account
    //      But in the future I might add the ability to log out of accounts that are not the current account
    const currentAccount = getCurrentAccount();
    if(currentAccount && currentAccount.username == account.username) {
        deleteCookie(cookieCurrentAccountName);
    }

    // set session to empty
    setSession({ ...session, user: {} as LocalUserView, account: undefined, defaultAccount: wasDefault ? undefined : defaultAccount });

    // redirect to home
    router.push("/");
}

/**
 * Logs in user and redirects to home
 * @param param0 
 */
export const handleLogin = async ({ 
    session, setSession, router, accountWithSite } : { 
        session: any, setSession: Function, router: any, accountWithSite: AccountWithSiteResponse 
    }) => {

    const account: Account = {
        jwt: accountWithSite.jwt,
        instance: accountWithSite.instance,
        username: accountWithSite.username,
        user: accountWithSite.user,
    }

    // set session to the account
    setSession({ ...session, user: accountWithSite.user, account: account }); 
    
    // save the account
    console.log("Saving account", accountWithSite)
    saveAccount(account);

    // set the account to the current account
    setCurrentAccount(account.username);

    const userData = await saveUserDataToLocalStorage(accountWithSite);

    if(!userData) {
        console.error("Failed to get and store user data");
    }

    // redirect to home
    router.push("/");
}

/**
 * Gets the user data from the instance
 * Will always fetch new data
 * Can also handle getting SiteResponse without login
 * @param instance 
 * @param jwt 
 */
export const getUserData = async (instance: string, jwt?: string): Promise<GetSiteResponse | undefined> => {
    const client = new LemmyHttp(`https://${instance}`);
    const site = await client.getSite({ auth: jwt });
    return site ;
}

/**
 * Saves GetSiteResponse to localStorage, may fetch new data
 * Retuns GetSiteResponse if successful, undefined if not
 * @param account 
 * @returns 
 */
export const saveUserDataToLocalStorage = async (account: AccountWithSiteResponse): Promise<GetSiteResponse | undefined> => {
    // check if the user data is already in localStorage
    const userDataRaw = localStorage.getItem(`${account.username}@${account.instance}`);
    if(userDataRaw) {
        const userData = JSON.parse(userDataRaw) as GetSiteResponse;
        return userData;
    }

    const userData = await getUserData(account.instance, account.jwt);
    if(userData) {
        localStorage.setItem(`${account.username}@${account.instance}`, JSON.stringify(userData));
        return userData;
    }
    return undefined
}

/**
 * Returns GetSiteResponse from localStorage
 * Will never fetch new data
 * Retuns GetSiteResponse if successful, undefined if not
 * @param account
 * @returns 
 */
export const getUserDataFromLocalStorage = (account: Account): AccountWithSiteResponse | undefined => {
    const userDataRaw = localStorage.getItem(`${account.username}@${account.instance}`);
    if(userDataRaw) {
        const userData = JSON.parse(userDataRaw) as GetSiteResponse;
        return { ...account, site: userData};
    }
    return undefined;
}

/**
 * Sets a single account as a cookie
 * @param jwt 
 * @param instance 
 * @param username 
 */
export const saveAccount = (account : Account) => {
    const newAccount: Account = account;

    // get the current accounts
    const accounts = getAccounts();

    // check if the account already exists
    const existingAccount = accounts.find(acc => acc.username == newAccount.username);

    if(!existingAccount) {
        // add the new account
        accounts.push(newAccount);

        // save new accounts
        overrideAccounts(accounts);
    }
    // if there is no default account, set the new account as the default account
        const defaultAccount = getDefaultAccount();

        if(!defaultAccount) {
            setDefaultAccount(newAccount.username);
        }
}

/**
 * Returns a single account or undefined if not found
 * @param username 
 * @returns Account | undefined
 */
export const getSingleAccount = (username: string) : Account | undefined => {
    const accounts = getAccounts();
    const account = accounts.find(account => account.username == username);
    if(account) {
        return account;
    }
    return undefined;
}

export const overrideAccounts = (accounts: Account[]) => {
    setCookie(cookieName, JSON.stringify(accounts), defaultCookieSettings)
}

/**
 * Returns accounts by getting them from the cookie.
 * 
 * **Note: This only works in *client side* components**
 * @returns an array of accounts
 */
export const getAccounts = () : Account[] => {
    const accountsRaw = getCookie(cookieName);
    if(accountsRaw && typeof accountsRaw == "string" && accountsRaw.length > 0) {
        const accounts: Account[] = JSON.parse(accountsRaw);
        if(Array.isArray(accounts)) {
            return accounts;
        }
    }
    return [];
}

/**
 * Returns accounts by getting them from the cookie.
 * 
 * **Note: This only works in *server side* components**
 * @param cookiesStore 
 * @returns 
 */
export const getAccountsServerSide = (cookiesStore: ReadonlyRequestCookies) : Account[] => {
    const accountsRaw = cookiesStore.get(cookieName)?.value;

    // {} is the default value if the cookie is not set
    if(accountsRaw && accountsRaw.length > 3) {
        const accounts: Account[] = JSON.parse(accountsRaw);
        return accounts;
    } else {
        return [];
    }
}

/**
 * Returns the default account or undefined if not found
 * 
 * **Note: This only works in *client side* components**
 * @returns Account | undefined
 */
export const getDefaultAccount = () : Account | undefined => {
    const defaultAccount = getCookie(cookieDefaultAccountName);
    if(defaultAccount && typeof defaultAccount == "string" && defaultAccount.length > 0) {
        return JSON.parse(defaultAccount) as Account;
    }
    return undefined;
}

/**
 * Returns the default account or undefined if not found
 * 
 * **Note: This only works in *server side* components**
 * @param cookiesStore 
 * @returns 
 */
export const getDefaultAccountServerSide = (cookiesStore: ReadonlyRequestCookies) : Account | undefined => {
    const defaultAccount = cookiesStore.get(cookieDefaultAccountName)?.value;
    if(defaultAccount && defaultAccount.length > 3) {
        return JSON.parse(defaultAccount) as Account;
    }
    return undefined;
}

/**
 * Sets the default account as a cookie
 * @param username 
 */
export const setDefaultAccount = (username: string) => {
    const accounts = getAccounts();
    const account = accounts.find(account => account.username == username);
    if(account) {
        setCookie(cookieDefaultAccountName, account, defaultCookieSettings);
    }
}

/**
 * Sets the current account as a cookie
 * @param username 
 */
export const setCurrentAccount = (username: string) => {
    const accounts = getAccounts();
    const account = accounts.find(account => account.username == username);
    if(account) {
        setCookie(cookieCurrentAccountName, account, defaultCookieSettings);
    }
}

/**
 * Returns the current account or undefined if not found
 * Will return the current account with the site response
 * **Note: This only works in *client side* components**
 * @returns 
 */
export const getCurrentAccount = () : AccountWithSiteResponse | undefined => {
    const currentAccount = getCookie(cookieCurrentAccountName);
    if(currentAccount && typeof currentAccount == "string" && currentAccount.length > 0) {
        const account = JSON.parse(currentAccount) as Account;
        const accountWithSite = getUserDataFromLocalStorage(account);
        return accountWithSite; // can be undefined
    }
    return undefined;
}

/**
 * Return the current account or undefined if not found
 * 
 * **Does not return the site response**
 * 
 * **Note: This only works in *server side* components**
 * @param cookiesStore 
 * @returns 
 */
export const getCurrentAccountServerSide = (cookiesStore: ReadonlyRequestCookies) : Account | undefined => {
    const currentAccount = cookiesStore.get(cookieCurrentAccountName)?.value;
    if(currentAccount && currentAccount.length > 3) {
        return JSON.parse(currentAccount) as Account;
    }
    return undefined;
}

/**
 * Removes all accounts from the cookie, aka logs out of all accounts
 */
export const wipeAccounts = () => {
    deleteCookie(cookieName);
    deleteCookie(cookieDefaultAccountName);
}

/**
 * Removes the deprecated system
 */
export const cleanDeprecatedSystem = () => {
    deleteCookie("jwt");
    deleteCookie("instance");
}

export const switchToAccount = (account: Account, setSession: Dispatch<SetStateAction<SessionState>>) => {
    setCurrentAccount(account.username);

    // set session to the account
    setSession(prevState => {
        return { ...prevState, currentAccount: account }
    });
}