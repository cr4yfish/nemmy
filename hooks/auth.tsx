"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { GetSiteResponse } from "lemmy-js-client";
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
} from "@/utils/authFunctions";
import { DEFAULT_INSTANCE } from "@/constants/settings";

export interface Settings {
  theme: "light" | "dark" | "system";
  cardType: "modern" | "compact" | "auto";
  blockedInstances: string[];
  useSystemTheme: boolean;
  showNSFW: boolean;
  showBotAccounts: boolean;
  showAvatars: boolean;
}

export interface SessionState {
  pendingAuth: boolean;
  accounts: Account[];
  currentAccount?: Account;
  siteResponse?: GetSiteResponse;
  isLoggedIn: boolean;
  settings: Settings
}

export const defaultState: SessionState = {
  currentAccount: undefined,
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
  }
};

interface SessionContextProps {
  session: SessionState;
  setSession: React.Dispatch<React.SetStateAction<SessionState>>;
}

const SessionContext = createContext<SessionContextProps>({
  session: defaultState,
  setSession: () => {},
});

export function setTheme(theme: "light" | "dark" | "system", useSystemTheme?: boolean) {
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

  // Auto fetch session data
  useEffect(() => {
    try {
      if (!session.pendingAuth) return;

      // Clean deprecated system
      cleanDeprecatedSystem();

      const accounts = getAccounts();
      const hasAccounts = accounts.length > 0;

      if (hasAccounts) {
        let defaultAccount = getDefaultAccount();
        let currentAccountWithSite = getCurrentAccount();

        if (currentAccountWithSite) {

          setTheme(currentAccountWithSite.settings.theme);

          const currentAccount = {
            user: currentAccountWithSite.user,
            username: currentAccountWithSite.username,
            jwt: currentAccountWithSite.jwt,
            instance: currentAccountWithSite.instance,
            settings: currentAccountWithSite.settings,
          };

          setSession({
            ...session,
            accounts: accounts,
            currentAccount: currentAccount,
            pendingAuth: false,
            siteResponse: currentAccountWithSite.site,
            isLoggedIn: true,
            settings: currentAccountWithSite.settings
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

        setTheme(defaultAccount.settings.theme);
        setSession({
          ...session,
          accounts: accounts,
          currentAccount: defaultAccount,
          pendingAuth: false,
          isLoggedIn: true,
          settings: defaultAccount.settings
        });
        return;
      } else {
        // Has no accounts
        throw new Error("No accounts found");
      }
    } catch (e) {
      // Fallback, some error happened
      console.warn(e);

      // get site data for current instance
      getUserData(new URL(DEFAULT_INSTANCE).host)
        .then((res) => {
          setTheme("dark");
          setSession({ ...session, pendingAuth: false, siteResponse: res, isLoggedIn: false, settings: defaultState.settings });
          return;
        })
        .catch((err) => {
          console.error(err);
          setTheme("dark");
          setSession({ ...session, pendingAuth: false, isLoggedIn: false, settings: defaultState.settings });
          return;
        });
    }
  }, [session]);

  // This can update on runtime
  useEffect(() => {
    const newTheme = setTheme(session.settings.theme, session.settings.useSystemTheme) // Also takes system theme into account

    if(newTheme !== session.settings.theme) {
      setSession({ ...session, settings: { ...session.settings, theme: newTheme } });
    }
    // update account settings in cookie
    const currentAccount = session.currentAccount;
    if (currentAccount) {
      if(currentAccount.settings == session.settings) return;
      
      currentAccount.settings = session.settings;
      currentAccount.settings.theme = newTheme;
      updateCurrentAccount(currentAccount, session, setSession);
    }
    
  }, [session.settings])
  
  useEffect(() => {
    // use window
    if (typeof window === "undefined") return;
    const browserTheme = window.matchMedia("(prefers-color-scheme: dark)");
    browserTheme.addEventListener("change", (e) => {
      if (e.matches) {
        setSession({ ...session, settings: { ...session.settings, theme: "dark" } });
      } else {
        setSession({ ...session, settings: { ...session.settings, theme: "light" } });
      }
    }
    );

    return () => browserTheme.removeEventListener("change", () => { });
  }, [])

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
