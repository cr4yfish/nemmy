"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PersonView, GetSiteResponse} from 'lemmy-js-client';
import { getCookies } from 'cookies-next';
import { getUserDetails } from '@/utils/lemmy';
import { DEFAULT_INSTANCE } from '@/constants/settings';

interface SessionState {
    user: GetSiteResponse,
    jwt: string,
    pendingAuth: boolean,
    defaultInstance: string
}

interface SessionContextProps {
    session: SessionState;
    setSession: React.Dispatch<React.SetStateAction<SessionState>>;
}

const defaultState: SessionState = { user: {} as GetSiteResponse, jwt: "", pendingAuth: true, defaultInstance: DEFAULT_INSTANCE }
const SessionContext = createContext<SessionContextProps>({ session: defaultState, setSession: () => { } })

export const SessionContextProvider = ({ children } : { children: any }) => {

    const [session, setSession] = useState<SessionState>(defaultState);

    // Auto fetch session data
    useEffect(() => {
        try {
            if (!session.pendingAuth) return;
            
            // try session storage
            let jwt = sessionStorage.getItem("jwt") == null ? "" : sessionStorage.getItem("jwt");
            let instance = sessionStorage.getItem("instance") == null ? "" : sessionStorage.getItem("instance");

            // try cookies
            const cookies = getCookies();
            jwt = (jwt == "" && cookies.jwt) ? cookies.jwt : jwt;
            instance = (instance == "" && cookies.instance) ? cookies.instance : instance;

            if (jwt && jwt.length > 1 && instance && instance.length > 1) {
                getUserDetails(jwt, instance).then(res => {
                    const instanceUrl = new URL(res.my_user!.local_user_view.person.actor_id).host;
                    setSession({ ...session, user: res, jwt: jwt!, pendingAuth: false, defaultInstance: instanceUrl })
                })
            } else {
                throw new Error("No session data found")
            }
        } catch (e) {
            console.warn(e);
            setSession({ ...session, user: {} as GetSiteResponse, jwt: "", pendingAuth: false, defaultInstance: DEFAULT_INSTANCE })
        }
    }, [])

    return (
        <SessionContext.Provider value={{ session, setSession }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => useContext(SessionContext);