"use client";

import { ListingType, SortType } from 'lemmy-js-client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { disablePageScroll, enablePageScroll } from 'scroll-lock';

export interface NavbarState {
    showMenu: boolean,
    showFilter: boolean,
    showSort: boolean,
    showSearch: boolean,
    showUser: boolean,
    showback: boolean,
    hidden: boolean,
    overlayActive: boolean,
    currentSort: SortType,
    currentType: ListingType,
    titleOverride: string,
    icon: string;
}

interface NavbarContextProps {
    navbar: NavbarState | undefined;
    setNavbar: React.Dispatch<React.SetStateAction<NavbarState>>;
}

const defaultState: NavbarState = { 
    showMenu: true, showFilter: true, showSort: true, showSearch: true,
    showUser: true, hidden: false, showback: false, overlayActive: false, currentSort: "Active", currentType: "All",
    titleOverride: "", icon: ""
}
const NavbarContext = createContext<NavbarContextProps>({ navbar: defaultState, setNavbar: () => { } })

export const NavbarContextProvider = ({ children } : { children: any }) => {

    const [navbar, setNavbar] = useState<NavbarState>(defaultState);

    useEffect(() => {
        if (navbar.overlayActive) {
            disablePageScroll();
        } else {
            enablePageScroll();
        }
    }, [navbar.overlayActive])

    return (
        <NavbarContext.Provider value={{ navbar, setNavbar }}>
            {children}
        </NavbarContext.Provider>
    );
};

export const useNavbar = () => useContext(NavbarContext);