import { deleteCookie } from "cookies-next";
import { GetSiteResponse } from "lemmy-js-client";

export const handleLogout = async ({ session, setSession, router } : { session: any, setSession: Function, router: any }) => {
        
    // delete the cookie
    deleteCookie("jwt");

    // delete sessionStorage
    sessionStorage.removeItem("jwt");

    // set session to empty
    setSession({ ...session, user: {} as GetSiteResponse, jwt: "" });

    // redirect to home
    router.push("/");
}