"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PersonView, GetSiteResponse} from 'lemmy-js-client';
import { getCookies } from 'cookies-next';
import { getUserDetails } from '@/utils/lemmy';

interface SessionState {
    user: GetSiteResponse,
    jwt: string
}

interface SessionContextProps {
    session: { user: GetSiteResponse, jwt: string } | undefined;
    setSession: React.Dispatch<React.SetStateAction<SessionState>>;
}

const defaultState: SessionState = { user: {} as GetSiteResponse, jwt: "" }
const SessionContext = createContext<SessionContextProps>({ session: defaultState, setSession: () => { } })

export const SessionContextProvider = ({ children } : { children: any }) => {

    const [session, setSession] = useState<SessionState>({} as SessionState);

    // Auto fetch session data
    useEffect(() => {

        // try session storage
        const sessionJwt = sessionStorage.getItem("jwt");

        // try cookies
        const cookies = getCookies();
        const jwt = cookies.jwt;

        if (sessionJwt) {
            getUserDetails(sessionJwt).then(res => {
                setSession({ user: res, jwt: sessionJwt })
            })
        } else if (jwt) {
            getUserDetails(jwt).then(res => {
                setSession({ user: res, jwt: jwt })
            })
        }

    }, [])

    return (
        <SessionContext.Provider value={{ session, setSession }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => useContext(SessionContext);