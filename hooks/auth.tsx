"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  CommentSortType,
  GetSiteResponse,
  ListingType,
  LocalUserView,
  SortType,
} from "lemmy-js-client";

import { useRouter } from "next/navigation";

import {
  getAccounts,
  Account,
  getDefaultAccount,
  setDefaultAccount,
  cleanDeprecatedSystem,
  getCurrentAccount,
  getUserData,
  setCurrentAccount,
  updateAccount,
  updateCurrentAccount,
  updateAccountToNewSystem,
  updateAccountsToNewSystem,
  saveAccount,
  overrideAccounts,
  handleLogout,
} from "@/utils/authFunctions";
import {
  DEFAULT_COMMENT_SORT_TYPE,
  DEFAULT_INSTANCE,
  DEFAULT_SORT_TYPE,
} from "@/constants/settings";

export interface Settings {
  theme: "light" | "dark" | "system";
  cardType: "modern" | "compact" | "auto";
  blockedInstances: string[];
  useSystemTheme: boolean;
  showNSFW: boolean;
  showBotAccounts: boolean;
  showAvatars: boolean;
}

// Like setting, but non-perstistent
export interface Session {
  selectedCommunities: string[];
}

export interface SessionState {
  pendingAuth: boolean;
  accounts: Account[];
  currentAccount?: Account;
  siteResponse?: GetSiteResponse;
  isLoggedIn: boolean;
  settings: Settings;
  session: Session;
}

export const defaultState: SessionState = {
  currentAccount: {
    instanceAccounts: [],
    settings: {} as Settings,
    username: "",
    user: {} as LocalUserView,
  },
  accounts: [],
  pendingAuth: true,
  isLoggedIn: false,
  settings: {
    theme: "dark",
    cardType: "modern",
    blockedInstances: [],
    useSystemTheme: true,
    showNSFW: true,
    showBotAccounts: true,
    showAvatars: true,
  },
  session: {
    selectedCommunities: [],
  },
};

interface SessionContextProps {
  session: SessionState;
  setSession: React.Dispatch<React.SetStateAction<SessionState>>;
}

const SessionContext = createContext<SessionContextProps>({
  session: defaultState,
  setSession: () => {},
});

export function setTheme(
  theme: "light" | "dark" | "system",
  useSystemTheme?: boolean,
) {
  if (theme === "dark" && !useSystemTheme) {
    document.getElementsByTagName("html")[0].classList.add("dark");
    return "dark";
  } else if (theme === "light" && !useSystemTheme) {
    document.getElementsByTagName("html")[0].classList.remove("dark");
    return "light";
  } else if (useSystemTheme) {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.getElementsByTagName("html")[0].classList.add("dark");
      return "dark";
    } else {
      document.getElementsByTagName("html")[0].classList.remove("dark");
      return "light";
    }
  }
  return "dark";
}

export const SessionContextProvider = ({ children }: { children: any }) => {
  const [session, setSession] = useState<SessionState>(defaultState);
  const router = useRouter();

  // Auto fetch session data
  useEffect(() => {
    try {
      if (!session.pendingAuth) return;

      // Clean deprecated system
      cleanDeprecatedSystem();

      let accounts = getAccounts();
      const hasAccounts = accounts.length > 0;

      if (hasAccounts) {
        let defaultAccount = getDefaultAccount();
        let currentAccountWithSite = getCurrentAccount();

        if (currentAccountWithSite) {
          setTheme(currentAccountWithSite?.settings?.theme || "system");

          // Update to new system by just logging users out if they use the old system
          if (
            currentAccountWithSite.hasOwnProperty("jwt") ||
            currentAccountWithSite.hasOwnProperty("instance")
          ) {
            alert(
              "You are using an old version of the Authentication system. You will be logged out and and have to log in again to upgrade to the new system.",
            );
            // log out and reset
            handleLogout({
              session,
              setSession,
              router,
              account: currentAccountWithSite,
            });
          }

          const currentAccount: Account = {
            user: currentAccountWithSite.user,
            username: currentAccountWithSite.username,
            instanceAccounts: currentAccountWithSite.instanceAccounts,
            settings: currentAccountWithSite.settings,
          };

          setSession({
            ...session,
            accounts: accounts,
            currentAccount: currentAccount,
            pendingAuth: false,
            siteResponse: currentAccountWithSite.site,
            isLoggedIn: true,
            settings: currentAccountWithSite.settings || defaultState.settings,
          });
          return;
        }

        // Handle no default account
        if (!defaultAccount)
          console.error(
            "No default account found, using first account as default",
          );
        const newDefaultAccount = accounts[0];
        setDefaultAccount(newDefaultAccount.username);
        defaultAccount = newDefaultAccount;

        setTheme(defaultAccount?.settings?.theme || "system");
        setSession({
          ...session,
          accounts: accounts,
          currentAccount: defaultAccount,
          pendingAuth: false,
          isLoggedIn: true,
          settings: defaultAccount.settings || defaultState.settings,
        });
        return;
      } else {
        // Has no accounts

        // Make new empty accounts cookies
        const newAccounts: Account[] = [];
        overrideAccounts(newAccounts);

        throw new Error("No accounts found");
      }
    } catch (e) {
      // Fallback, some error happened
      console.warn(e);

      // get site data for current instance
      getUserData(new URL(DEFAULT_INSTANCE).host)
        .then((res) => {
          setTheme("dark");
          setSession({
            ...session,
            pendingAuth: false,
            siteResponse: res,
            isLoggedIn: false,
            settings: defaultState.settings,
            currentAccount: defaultState.currentAccount,
          });
          return;
        })
        .catch((err) => {
          console.error(err);
          setTheme("dark");
          setSession({
            ...session,
            pendingAuth: false,
            isLoggedIn: false,
            settings: defaultState.settings,
            currentAccount: defaultState.currentAccount,
          });
          return;
        });
    }
  }, [session]);

  // This can update on runtime
  useEffect(() => {
    const newTheme = setTheme(
      session.settings?.theme,
      session.settings?.useSystemTheme,
    ); // Also takes system theme into account

    if (newTheme !== session.settings.theme) {
      setSession({
        ...session,
        settings: { ...session.settings, theme: newTheme },
      });
    }
    // update account settings in cookie
    const currentAccount = session.currentAccount;

    if (currentAccount) {
      // Add blockedInstances if not set
      if (currentAccount?.settings.blockedInstances === undefined) {
        currentAccount.settings.blockedInstances = [];
      }

      currentAccount.settings = session.settings;
      currentAccount.settings.theme = newTheme;
      updateCurrentAccount(currentAccount, session, setSession);
    }
  }, [session.settings]);

  useEffect(() => {
    // use window
    if (typeof window === "undefined") return;
    const browserTheme = window.matchMedia("(prefers-color-scheme: dark)");
    browserTheme.addEventListener("change", (e) => {
      if (e.matches) {
        setSession({
          ...session,
          settings: { ...session.settings, theme: "dark" },
        });
      } else {
        setSession({
          ...session,
          settings: { ...session.settings, theme: "light" },
        });
      }
    });

    return () => browserTheme.removeEventListener("change", () => {});
  }, []);

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
