import { deleteCookie } from "cookies-next";
import { GetSiteResponse } from "lemmy-js-client"

const getUserDetails = async (jwt: string) :  Promise<(boolean | GetSiteResponse)> => {
    const user: GetSiteResponse = await fetch(`/api/getSite?auth=${jwt}`).then(res => res.json());
    console.log("user:", user);
    if(!user.my_user) {
        console.warn("user.my_user is null -> JWT is invalid");
        sessionStorage.removeItem("jwt");
        deleteCookie("jwt");
        return false;
    }
    return user as GetSiteResponse;
}

  
export { getUserDetails }