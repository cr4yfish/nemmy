import { deleteCookie, setCookie } from "cookies-next";
import { GetSiteResponse } from "lemmy-js-client";

export const handleLogout = async ({ session, setSession, router } : { session: any, setSession: Function, router: any }) => {
        
    // delete the cookie
    deleteCookie("jwt");
    deleteCookie("instance");

    // delete sessionStorage
    sessionStorage.removeItem("jwt");
    sessionStorage.removeItem("instance");

    // set session to empty
    setSession({ ...session, user: {} as GetSiteResponse, jwt: "" });

    // redirect to home
    router.push("/");
}

export const setCookies = (jwt: string, instance: string) => {
    setCookie("jwt", jwt, { maxAge: 60 * 60 * 24 * 30, domain: undefined })
    setCookie("instance", instance, { maxAge: 60 * 60 * 24 * 30, domain: undefined })
    sessionStorage.setItem("jwt", jwt);
    sessionStorage.setItem("instance", instance);
}