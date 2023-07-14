"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PersonView, GetSiteResponse} from 'lemmy-js-client';
import { getCookies } from 'cookies-next';
import { getUserDetails } from '@/utils/lemmy';

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

const defaultState: SessionState = { user: {} as GetSiteResponse, jwt: "", pendingAuth: true, defaultInstance: "lemmy.ml" }
const SessionContext = createContext<SessionContextProps>({ session: defaultState, setSession: () => { } })

export const SessionContextProvider = ({ children } : { children: any }) => {

    const [session, setSession] = useState<SessionState>(defaultState);

    // Auto fetch session data
    useEffect(() => {
        
        // try session storage
        let jwt = sessionStorage.getItem("jwt") == null ? "" : sessionStorage.getItem("jwt");
        let instance = sessionStorage.getItem("instance") == null ? "" : sessionStorage.getItem("instance");

        // try cookies
        const cookies = getCookies();
        jwt = (jwt == "" && cookies.jwt) ? cookies.jwt : jwt;
        instance = (instance == "" && cookies.instance) ? cookies.instance : instance;

        if (jwt && jwt.length > 1 && instance && instance.length > 1) {
            getUserDetails(jwt, instance).then(res => {
                if(typeof res == "boolean") {
                    console.error("Failed to validate user details. JWT has been wiped.")
                    console.log(res);
                    setSession({ user: {} as GetSiteResponse, jwt: "", pendingAuth: false, defaultInstance: "lemmy.ml" })
                    return;
                } else {
                    setSession({ ...session, user: res, jwt: jwt!, pendingAuth: false })
                }
            })
        } else {
            setSession({ ...session, user: {} as GetSiteResponse, jwt: "", pendingAuth: false })
        }

    }, [])

    return (
        <SessionContext.Provider value={{ session, setSession }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => useContext(SessionContext);