import { cookies } from "next/dist/client/components/headers";
import { GetPersonDetailsResponse, LemmyHttp } from "lemmy-js-client";


import UserPage from "@/components/PageComponents/UserPage";

import { getCurrentAccountServerSide } from "@/utils/authFunctions";
import { DEFAULT_INSTANCE } from "@/constants/settings";


async function getInitialUser(username: string, instance?: string): Promise<GetPersonDetailsResponse> {
    const client = new LemmyHttp(instance ? `https://${instance}` : DEFAULT_INSTANCE);
    return await client.getPersonDetails({ username });
}

export default async function User({ params: { slug }} : { params: { slug: string }}) {

    const userName = slug.replace("%40", "@");
    const userInstance = userName.split("@")[1];

    const cookiesStore = cookies();
    const account = getCurrentAccountServerSide(cookiesStore);

    const initialUser = await getInitialUser(userName, account?.instance);

    return (
        <>
        <UserPage initialUser={initialUser} userInstance={userInstance} />
        </>
    )
}