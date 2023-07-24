import { LemmyHttp, GetPersonMentions, GetPersonMentionsResponse, GetRepliesResponse } from "lemmy-js-client";
import { cookies } from "next/dist/client/components/headers";

import InboxCard from "@/components/ui/InboxCard";
import InboxInfiniteScroller from "@/components/ui/InboxInfiniteScroller";

import { DEFAULT_INSTANCE } from "@/constants/settings";
import { getCurrentAccountServerSide } from "@/utils/authFunctions";

async function getReplies({ 
        jwt, instance } : { 
        jwt?: string, instance?: string }): Promise<GetRepliesResponse> 
        {
    const lemmy = new LemmyHttp(instance ? `https://${instance}` : DEFAULT_INSTANCE);
    const replies = await lemmy.getReplies({
        auth: jwt ? jwt : "",
        sort: "New",
        page: 1,
        unread_only: false,
    })
    return replies;
}

export default async function Inbox({ params: { page } } : { params: { page: number } }) {
    const cookieStore = cookies();
    const currentAccount = getCurrentAccountServerSide(cookieStore);


    const replies = await getReplies({ jwt: currentAccount?.jwt, instance: currentAccount?.instance });

    return (
        <>
            <div className="flex flex-col gap-4 dark:gap-0 max-w-3xl h-full overflow-y-hidden">
                {replies.replies.map((reply, i) => (
                    <InboxCard key={i} reply={reply} />
                ))}
                {currentAccount && <InboxInfiniteScroller initReplies={replies} auth={currentAccount.jwt} instance={currentAccount.instance} />}
            </div>
        </>
    )

}