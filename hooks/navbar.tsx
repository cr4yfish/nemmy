"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PersonView, GetSiteResponse} from 'lemmy-js-client';
import { getCookies } from 'cookies-next';
import { getUserDetails } from '@/utils/lemmy';

interface NavbarState {
    showSort: boolean,
    showSearch: boolean,
    showUser: boolean,
    showback: boolean,
    hidden: boolean,
}

interface NavbarContextProps {
    navbar: NavbarState | undefined;
    setNavbar: React.Dispatch<React.SetStateAction<NavbarState>>;
}

const defaultState: NavbarState = { showSort: true, showSearch: true, showUser: true, hidden: false, showback: false }
const NavbarContext = createContext<NavbarContextProps>({ navbar: defaultState, setNavbar: () => { } })

export const NavbarContextProvider = ({ children } : { children: any }) => {

    const [navbar, setNavbar] = useState<NavbarState>(defaultState);

    return (
        <NavbarContext.Provider value={{ navbar, setNavbar }}>
            {children}
        </NavbarContext.Provider>
    );
};

export const useNavbar = () => useContext(NavbarContext);