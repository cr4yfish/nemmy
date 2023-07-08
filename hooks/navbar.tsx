"use client";

import React, { createContext, useContext, useState } from 'react';

interface NavbarState {
    showMenu: boolean,
    showFilter: boolean,
    showSort: boolean,
    showSearch: boolean,
    showUser: boolean,
    showback: boolean,
    hidden: boolean,
    overlayActive: boolean,
}

interface NavbarContextProps {
    navbar: NavbarState | undefined;
    setNavbar: React.Dispatch<React.SetStateAction<NavbarState>>;
}

const defaultState: NavbarState = { showMenu: true, showFilter: true, showSort: true, showSearch: true, showUser: true, hidden: false, showback: false, overlayActive: false }
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