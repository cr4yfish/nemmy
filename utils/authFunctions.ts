import { deleteCookie, setCookie, getCookie } from "cookies-next";
import { OptionsType } from "cookies-next/lib/types";
import { SessionState, Settings } from "@/hooks/auth";
import {
  GetSiteResponse,
  LemmyHttp,
  LocalUserView,
  SiteResponse,
} from "lemmy-js-client";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

import { Dispatch, SetStateAction } from "react";
import {
  getClient,
  getCommuntiy,
  getUserSettings,
  saveUserSettings,
  search,
  subscribeToCommunity,
} from "./lemmy";

export const cookieName = "accounts";
export const cookieCurrentAccountName = "currentAccount";
export const cookieDefaultAccountName = "defaultAccount";

const defaultCookieSettings: OptionsType = {
  maxAge: 60 * 60 * 24 * 30,
  domain: undefined,
  sameSite: "strict",
  secure: process.env.NODE_ENV == "production",
};

export type InstanceAccount = {
  instance: string;
  jwt: string;
};

export interface Account {
  instanceAccounts: InstanceAccount[];
  username: string;
  user: LocalUserView;
  settings: Settings;
}

export interface AccountWithSiteResponse extends Account {
  site: GetSiteResponse;
}

/**
 * Removes the account from the cookie
 * @param { session, setSession, router, account } : { session: SessionState, setSession: React.Dispatch<React.SetStateAction<SessionState>>, router: any, account: Account }
 */
export const handleLogout = async ({
  session,
  setSession,
  router,
  account,
}: {
  session: SessionState;
  setSession: React.Dispatch<React.SetStateAction<SessionState>>;
  router: any;
  account?: Account | AccountWithSiteResponse;
}) => {
  if (!account) return;
  const accounts = getAccounts();
  const defaultAccount = getDefaultAccount();
  let wasDefault = false;

  // remove the account from the cookie
  const newAccounts = accounts.filter(
    (acc) => acc.username != account.username,
  );
  overrideAccounts(newAccounts);

  // if the account was the default account, remove the default account
  if (defaultAccount && defaultAccount.username == account.username) {
    deleteCookie(cookieDefaultAccountName);
    wasDefault = true;
  }

  // if the account was the current account, remove the current account
  // Note: This should always be true since you can't log out of an account that is not the current account
  //      But in the future I might add the ability to log out of accounts that are not the current account
  const currentAccount = getCurrentAccount();
  if (currentAccount && currentAccount.username == account.username) {
    deleteCookie(cookieCurrentAccountName);

    // if there are no accounts left, wipe the accounts
    if (newAccounts.length == 0) {
      wipeAccounts();
      // set session to empty
      setSession({
        ...session,
        currentAccount: undefined,
        accounts: newAccounts,
        siteResponse: undefined,
      });
    }

    // if there is a default account, set the current account to the default account
    if (defaultAccount) {
      setCurrentAccount(defaultAccount.username);
      // get default account with site response
      const defaultAccountWithSite = getUserDataFromLocalStorage(
        defaultAccount.username,
        defaultAccount.instanceAccounts[0]?.instance,
      );
      setSession({
        ...session,
        currentAccount: defaultAccount,
        siteResponse: defaultAccountWithSite,
        accounts: newAccounts,
      });
    }

    // if there is no default account, set the current account to the first account in the list
    if (!defaultAccount && newAccounts.length > 0) {
      setCurrentAccount(newAccounts[0].username);
      // get new account with site response
      const newAccountWithSite = getUserDataFromLocalStorage(
        newAccounts[0].username,
        newAccounts[0].instanceAccounts[0]?.instance,
      );
      setSession({
        ...session,
        currentAccount: newAccounts[0],
        siteResponse: newAccountWithSite,
        accounts: newAccounts,
      });
    }
  } else {
    // set session to the account
    setSession({
      ...session,
      accounts: newAccounts,
      siteResponse: undefined,
      currentAccount: undefined,
    });
  }
  // redirect to home
  router.push("/");
};

/**
 * Logs in user and redirects to home
 * @param param0
 */
export const handleLogin = async ({
  session,
  setSession,
  router,
  accountWithSite,
}: {
  session: SessionState;
  setSession: React.Dispatch<React.SetStateAction<SessionState>>;
  router: any;
  accountWithSite: AccountWithSiteResponse;
}) => {
  const account: Account = {
    username: accountWithSite.username,
    instanceAccounts: accountWithSite.instanceAccounts,
    user: accountWithSite.user,
    settings: accountWithSite.settings,
  };

  // set session to the account
  setSession({
    ...session,
    currentAccount: account,
    accounts: [...session.accounts, account],
    siteResponse: accountWithSite.site,
    settings: accountWithSite.settings,
    isLoggedIn: true,
  });

  // save the account
  saveAccount(account);

  // set the account to the current account
  setCurrentAccount(account.username);

  const userData = await saveUserDataToLocalStorage(accountWithSite);

  if (!userData) {
    console.error("Failed to get and store user data");
  }

  // redirect to home
  router.push("/");
};

export const handleAddInstanceToAccount = async ({
  session,
  setSession,
  router,
  accountWithSite,
}: {
  session: SessionState;
  setSession: React.Dispatch<React.SetStateAction<SessionState>>;
  router: any;
  accountWithSite: AccountWithSiteResponse;
}) => {
  const account: Account = {
    username: accountWithSite.username,
    instanceAccounts: accountWithSite.instanceAccounts,
    user: accountWithSite.user,
    settings: accountWithSite.settings,
  };

  // sync settings and subscriptions
  // if there is a current account
  const currentSiteResponse = getUserDataFromLocalStorage(
    account.username,
    session.currentAccount?.instanceAccounts[0]?.instance || "",
  );
  const currentAccount = getCurrentAccount();
  if (currentSiteResponse && currentAccount) {
    console.log("syncing settings and subscriptions");
    const settings = getUserSettings({
      ...currentAccount,
      site: currentSiteResponse,
    });

    saveUserSettings(
      {
        ...settings, // settings from current account
        auth: account.instanceAccounts[0]?.jwt, // jwt from new instance
      },
      accountWithSite.instanceAccounts[0]?.instance,
    );

    // sync subscriptions
    const currentFollow = currentSiteResponse.my_user?.follows;
    console.log("currentFollow", currentFollow);
    for (const follow of currentFollow || []) {
      // get the community from the new instance
      const communityOnCurrentInstance = await getCommuntiy(
        {
          id: follow.community.id,
          auth: session.currentAccount?.instanceAccounts[0]?.jwt,
        },
        session.currentAccount?.instanceAccounts[0]?.instance,
      );
      console.log("communityOnCurrentInstance", communityOnCurrentInstance);

      console.log(
        "getting community on new instance",
        accountWithSite.instanceAccounts[0]?.instance,
      );
      // get the community from the new instance
      const searchResponse = await search(
        {
          type_: "Communities",
          q: communityOnCurrentInstance.community_view.community.name,
          listing_type: "All",
        },
        accountWithSite.instanceAccounts[0]?.instance,
      );
      if (searchResponse) {
        const communityOnNewInstance = searchResponse.communities.find(
          (community) =>
            community.community.name ==
            communityOnCurrentInstance.community_view.community.name,
        );
        console.log("communityOnNewInstance", communityOnNewInstance);

        if (!communityOnNewInstance) {
          console.error("Failed to find community on new instance");
          continue;
        }
        // subscribe to the community on the new instance
        const res = await subscribeToCommunity(
          {
            follow: true,
            community_id: communityOnNewInstance.community.id,
            auth: accountWithSite.instanceAccounts[0]?.jwt,
          },
          accountWithSite.instanceAccounts[0]?.instance,
        );
      }
      // Copy over follow list
      if (accountWithSite.site.my_user)
        accountWithSite.site.my_user.follows = currentFollow || [];
    }
  }

  const userData = await saveUserDataToLocalStorage(accountWithSite); // local storage

  if (!userData) {
    console.error("Failed to get and store user data");
  }

  // add instanceAccount to account with same username
  const newAccount = getSingleAccount(accountWithSite.username);
  newAccount?.instanceAccounts.push(accountWithSite.instanceAccounts[0]);

  const newAccounts = getAccounts().filter(
    (acc) => acc.username != accountWithSite.username,
  );
  newAccounts.push(newAccount as Account);

  overrideAccounts(newAccounts);
  setCurrentAccount(account.username);

  // set session to the account
  setSession({
    ...session,
    currentAccount: account,
    accounts: [...session.accounts, account],
    siteResponse: accountWithSite.site,
    settings: accountWithSite.settings,
    isLoggedIn: true,
  });

  // set the account to the current account
  setCurrentAccount(account.username);

  // redirect to home
  router.push("/");
};

/**
 * Gets the user data from the instance
 * Will always fetch new data
 * Can also handle getting SiteResponse without login
 * @param instance
 * @param jwt
 */
export const getUserData = async (
  instance: string,
  jwt?: string,
): Promise<GetSiteResponse | undefined> => {
  const client = getClient(instance);
  const site = await client.getSite({ auth: jwt });
  return site;
};

/**
 * Saves GetSiteResponse to localStorage, may fetch new data
 * Retuns GetSiteResponse if successful, undefined if not
 * @param account
 * @returns
 */
export const saveUserDataToLocalStorage = async (
  account: AccountWithSiteResponse,
): Promise<GetSiteResponse | undefined> => {
  // check if the user data is already in localStorage
  const userDataRaw = localStorage.getItem(
    `${account.username}@${account.instanceAccounts[0]?.instance}`,
  );
  if (userDataRaw) {
    const userData = JSON.parse(userDataRaw) as GetSiteResponse;
    return userData;
  }

  const userData = await getUserData(
    account.instanceAccounts[0]?.instance,
    account.instanceAccounts[0]?.jwt,
  );
  if (userData) {
    localStorage.setItem(
      `${account.username}@${account.instanceAccounts[0]?.instance}`,
      JSON.stringify(userData),
    );
    return userData;
  }
  return undefined;
};

/**
 * Returns GetSiteResponse from localStorage
 * Will never fetch new data
 * Retuns GetSiteResponse if successful, undefined if not
 * @param account
 * @returns
 */
export const getUserDataFromLocalStorage = (
  username: string,
  instance: string,
): GetSiteResponse | undefined => {
  const userDataRaw = localStorage.getItem(`${username}@${instance}`);
  if (userDataRaw) {
    const userData = JSON.parse(userDataRaw) as GetSiteResponse;
    return userData;
  }
  return undefined;
};

/**
 * Returns all accounts with site response
 *
 * **Note: This only works in *client side* components**
 * @returns an array of all accounts with site response
 */
export const getAllUserDataFromLocalStorage = (): AccountWithSiteResponse[] => {
  const accounts = getAccounts();
  const accountsWithSite: AccountWithSiteResponse[] = [];
  accounts.forEach((account) => {
    const accountWithSite = getUserDataFromLocalStorage(
      account.username,
      account.instanceAccounts[0]?.instance,
    );
    if (accountWithSite) {
      accountsWithSite.push({ ...account, site: accountWithSite });
    }
  });
  return accountsWithSite;
};

/**
 * Sets a single account as a cookie
 * @param jwt
 * @param instance
 * @param username
 */
export const saveAccount = (account: Account) => {
  const newAccount: Account = account;

  // get the current accounts
  const accounts = getAccounts();

  // check if the account already exists
  const existingAccount = accounts.find(
    (acc) => acc.username == newAccount.username,
  );

  if (!existingAccount) {
    // add the new account
    accounts.push(newAccount);

    // save new accounts
    overrideAccounts(accounts);
  }
  // if there is no default account, set the new account as the default account
  const defaultAccount = getDefaultAccount();

  if (!defaultAccount) {
    setDefaultAccount(newAccount.username);
  }
};

/**
 * Returns a single account or undefined if not found
 * @param username
 * @returns Account | undefined
 */
export const getSingleAccount = (username: string): Account | undefined => {
  const accounts = getAccounts();
  const account = accounts.find((account) => account.username == username);
  if (account) {
    return account;
  }
  return undefined;
};

export const overrideAccounts = (accounts: Account[]) => {
  setCookie(cookieName, JSON.stringify(accounts), defaultCookieSettings);
};

/**
 * Returns accounts by getting them from the cookie.
 *
 * **Note: This only works in *client side* components**
 * @returns an array of accounts
 */
export const getAccounts = (): Account[] => {
  const accountsRaw = getCookie(cookieName);
  if (accountsRaw && typeof accountsRaw == "string" && accountsRaw.length > 0) {
    const accounts: Account[] = JSON.parse(accountsRaw);
    if (Array.isArray(accounts)) {
      return accounts;
    }
  }
  return [];
};

/**
 * Returns accounts by getting them from the cookie.
 *
 * **Note: This only works in *server side* components**
 * @param cookiesStore
 * @returns
 */
export const getAccountsServerSide = (
  cookiesStore: ReadonlyRequestCookies,
): Account[] => {
  const accountsRaw = cookiesStore.get(cookieName)?.value;

  // {} is the default value if the cookie is not set
  if (accountsRaw && accountsRaw.length > 3) {
    const accounts: Account[] = JSON.parse(accountsRaw);
    return accounts;
  } else {
    return [];
  }
};

/**
 * Returns the default account or undefined if not found
 *
 * **Note: This only works in *client side* components**
 * @returns Account | undefined
 */
export const getDefaultAccount = (): Account | undefined => {
  const defaultAccount = getCookie(cookieDefaultAccountName);
  if (
    defaultAccount &&
    typeof defaultAccount == "string" &&
    defaultAccount.length > 0
  ) {
    return JSON.parse(defaultAccount) as Account;
  }
  return undefined;
};

/**
 * Returns the default account or undefined if not found
 *
 * **Note: This only works in *server side* components**
 * @param cookiesStore
 * @returns
 */
export const getDefaultAccountServerSide = (
  cookiesStore: ReadonlyRequestCookies,
): Account | undefined => {
  const defaultAccount = cookiesStore.get(cookieDefaultAccountName)?.value;
  if (defaultAccount && defaultAccount.length > 3) {
    return JSON.parse(defaultAccount) as Account;
  }
  return undefined;
};

/**
 * Sets the default account as a cookie
 * @param username
 */
export const setDefaultAccount = (username: string) => {
  const accounts = getAccounts();
  const account = accounts.find((account) => account.username == username);
  if (account) {
    setCookie(cookieDefaultAccountName, account, defaultCookieSettings);
  }
};

/**
 * Sets the current account as a cookie
 * Can also update the current account
 * @param username
 */
export const setCurrentAccount = (username: string) => {
  const accounts = getAccounts();
  const account = accounts.find((account) => account.username == username);
  if (account) {
    setCookie(cookieCurrentAccountName, account, defaultCookieSettings);
  }
};

/**
 * Returns the current account or undefined if not found
 * Will return the current account with the site response
 * **Note: This only works in *client side* components**
 * @returns
 */
export const getCurrentAccount = (): AccountWithSiteResponse | undefined => {
  const currentAccount = getCookie(cookieCurrentAccountName);
  if (
    currentAccount &&
    typeof currentAccount == "string" &&
    currentAccount.length > 0
  ) {
    const account = JSON.parse(currentAccount) as Account;
    if(!account?.instanceAccounts || account.instanceAccounts.length == 0) return undefined;
    const accountWithSite = getUserDataFromLocalStorage(
      account.username,
      account.instanceAccounts[0].instance,
    );
    if (!accountWithSite) return undefined;
    return { ...account, site: accountWithSite }; // can be undefined
  }
  return undefined;
};

/**
 * Return the current account or undefined if not found
 *
 * **Does not return the site response**
 *
 * **Note: This only works in *server side* components**
 * @param cookiesStore
 * @returns
 */
export const getCurrentAccountServerSide = (
  cookiesStore: ReadonlyRequestCookies,
): Account | undefined => {
  const currentAccount = cookiesStore.get(cookieCurrentAccountName)?.value;
  if (currentAccount && currentAccount.length > 3) {
    return JSON.parse(currentAccount) as Account;
  }
  return undefined;
};

/**
 * Removes all accounts from the cookie, aka logs out of all accounts
 */
export const wipeAccounts = () => {
  deleteCookie(cookieName);
  deleteCookie(cookieDefaultAccountName);
  deleteCookie(cookieCurrentAccountName);
};

/**
 * Removes the deprecated system
 */
export const cleanDeprecatedSystem = () => {
  deleteCookie("jwt");
  deleteCookie("instance");
};

/**
 * Switches to the account
 *
 * => Sets current account and site response
 *
 */
export const switchToAccount = (
  account: Account,
  setSession: Dispatch<SetStateAction<SessionState>>,
  session: SessionState,
) => {
  setCurrentAccount(account.username);

  // get site response
  const accountWithSite = getUserDataFromLocalStorage(
    account.username,
    account.instanceAccounts[0]?.instance,
  );

  // set session to the account
  setSession((prevState) => {
    return {
      ...prevState,
      currentAccount: account,
      siteResponse: accountWithSite,
    };
  });
};

/**
 * Sorts Accounts in state, so that "account" is first
 * @param account
 * @param session
 * @param setSession
 */
export const sortAccounts = (
  account: Account,
  session: SessionState,
  setSession: Dispatch<SetStateAction<SessionState>>,
) => {
  const accounts = session.accounts;

  // Sort accounts, so that account is first
  const newAccounts = accounts.filter(
    (acc) => acc.username != account.username,
  ); // Remove account
  newAccounts.unshift(account); // Add account as first element

  setSession((prevState) => {
    return { ...prevState, accounts: newAccounts };
  });
};

export const sortCurrentAccount = (
  session: SessionState,
  setSession: Dispatch<SetStateAction<SessionState>>,
) => {
  const currentAccount = getCurrentAccount();
  if (currentAccount && session) {
    sortAccounts(currentAccount, session, setSession);
  }
};

/**
 * Sorts instance accounts in state, so that "instanceAccount" is first
 */
export const sortInstanceAccounts = (
  instanceAccount: InstanceAccount,
  session: SessionState,
  setSession: Dispatch<SetStateAction<SessionState>>,
) => {
  const currentAccount = getCurrentAccount();
  if (currentAccount) {
    const newAccounts = currentAccount.instanceAccounts.filter(
      (acc) => acc.instance != instanceAccount.instance,
    ); // Remove instance account
    newAccounts.unshift(instanceAccount); // Add instance account as first element

    const newCurrentAccount = {
      ...currentAccount,
      instanceAccounts: newAccounts,
    };
    updateCurrentAccount(newCurrentAccount, session, setSession);
  }
};

/**
 * Updates the account in the cookie
 * @param updatedAccount
 */
export const updateAccount = (updatedAccount: Account) => {
  const accounts = getAccounts();
  const account = accounts.find(
    (account) => account.username == updatedAccount.username,
  );
  if (account) {
    account.settings = updatedAccount.settings;
    overrideAccounts(accounts);
  }
};

export const updateCurrentAccount = (
  updatedAccount: Account,
  session: SessionState,
  setSession: Dispatch<SetStateAction<SessionState>>,
) => {
  const currentAccount = getCurrentAccount();
  if (currentAccount) {
    updateAccount(updatedAccount);
    setCurrentAccount(updatedAccount.username);

    const site = getUserDataFromLocalStorage(
      updatedAccount.username,
      updatedAccount?.instanceAccounts[0]?.instance,
    );
    if (!site) return;
    const accountWithSite: AccountWithSiteResponse = {
      ...updatedAccount,
      site: site,
    };

    if (accountWithSite) {
      accountWithSite.settings = updatedAccount.settings;
      setSession((prevState) => {
        return {
          ...prevState,
          currentAccount: accountWithSite,
          siteResponse: accountWithSite?.site,
        };
      });
    }
  }
};

/**
 * takes account and updates it to new system if necessary
 * @param account
 */
export const updateAccountToNewSystem = (account: any): Account => {
  if (account.instance || account.jwt) {
    const newInstanceAccount: InstanceAccount = {
      instance: account.instance,
      jwt: account.jwt,
    };

    account.instanceAccounts = [newInstanceAccount];
    account.delete("instance");
    account.delete("jwt");
    return account;
  }
  // No changes needed
  return account;
};

export const updateAccountsToNewSystem = (accounts: Account[]): Account[] => {
  const newAccounts: Account[] = [];
  for (const account in accounts) {
    newAccounts.push(updateAccountToNewSystem(account));
  }
  return newAccounts;
};
