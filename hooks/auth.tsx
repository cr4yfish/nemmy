"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { GetSiteResponse} from 'lemmy-js-client';
import { getAccounts, Account, getDefaultAccount, 
    setDefaultAccount, cleanDeprecatedSystem, 
    getCurrentAccount } from '@/utils/authFunctions';

export interface SessionState {
    pendingAuth: boolean,
    accounts: Account[],
    currentAccount?: Account,
    siteResponse?: GetSiteResponse,
}

const defaultState: SessionState = {
    currentAccount: undefined,
    accounts: [],
    pendingAuth: true,
}

interface SessionContextProps {
    session: SessionState;
    setSession: React.Dispatch<React.SetStateAction<SessionState>>;
}

const SessionContext = createContext<SessionContextProps>({ session: defaultState, setSession: () => { } })

export const SessionContextProvider = ({ children } : { children: any }) => {

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

                if(currentAccountWithSite) {
                    const currentAccount = { 
                        user: currentAccountWithSite.user, 
                        username: currentAccountWithSite.username, 
                        jwt: currentAccountWithSite.jwt,
                        instance: currentAccountWithSite.instance,
                    };
                    setSession({ ...session, accounts: accounts, 
                        currentAccount: currentAccount, pendingAuth: false, siteResponse: currentAccountWithSite.site })
                    return;
                }

                // Handle no default account
                    if(!defaultAccount) console.error("No default account found, using first account as default");
                    const newDefaultAccount = accounts[0];
                    setDefaultAccount(newDefaultAccount.username);
                    defaultAccount = newDefaultAccount;

                setSession({ ...session, accounts: accounts, currentAccount: defaultAccount, pendingAuth: false })
                return;
            } else {
                setSession({ ...session, pendingAuth: false })
                return;
            }
        } catch (e) {
            console.warn(e, "setting pending auth to false");
            setSession({ ...session, pendingAuth: false })
            return;
        }
    }, [session])

    return (
        <SessionContext.Provider value={{ session, setSession }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => useContext(SessionContext);