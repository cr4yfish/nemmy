import { LemmyHttp, GetSiteResponse } from "lemmy-js-client"

const getUserDetails = async (jwt: string) => {
    const user: GetSiteResponse = await fetch(`/api/getSite?auth=${jwt}`).then(res => res.json());
    return user as GetSiteResponse;
}

  
export { getUserDetails }