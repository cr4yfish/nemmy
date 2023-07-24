import { LemmyHttp, PrivateMessageView, PrivateMessagesResponse } from "lemmy-js-client"
import { cookies } from "next/dist/client/components/headers";
import Link from "next/link";

import RenderMarkdown from "@/components/ui/RenderMarkdown";
import { DEFAULT_INSTANCE, DEFAULT_AVATAR } from "@/constants/settings";
import RenderError from "@/components/ui/RenderError";

import { getCurrentAccountServerSide } from "@/utils/authFunctions";

import styles from "@/styles/chat.module.css";

// Returns all messages from a specific user, sorted by newest message
async function getMessages({ auth, instance, creator} : { auth: string, instance: string, creator: string }): Promise<PrivateMessageView[]> {
    const client = new LemmyHttp(instance ? `https://${instance}` : DEFAULT_INSTANCE);
    const messages = await client.getPrivateMessages({ 
        auth: auth, 
        page: 1,
        unread_only: false,
    });

    // Get all messages from and to the creator
    const filtered = messages.private_messages.filter((m) => (m.creator.name == creator) || (m.recipient.name == creator));

    // sort by newest message
    filtered.sort((a, b) => {
        return new Date(b.private_message.published).getTime() - new Date(a.private_message.published).getTime();
    }).reverse();

    return filtered;
}

function addZero(n: number) {
    return n < 10 ? `0${n}` : n;
}

function getDayMonth(date: string) {
    const d = new Date(date);
    return `${addZero(d.getDate())}.${addZero(d.getMonth() + 1)}`
}

function getHoursMinutes(date: string) {
    const d = new Date(date);
    return `${addZero(d.getHours())}:${addZero(d.getMinutes())}`
}

function RenderDate({ date } : { date: string }) {

    return (
        <>
        <span className="text-xs text-neutral-600 italic bg-neutral-700/10 p-1 px-2 rounded-full">{date}</span>
        </>
    )
}

export default async function UserChat({ params: { person } } : { params: { person: string } }) {
    try {
        const cookiesStore = cookies();
        const currentAccount = getCurrentAccountServerSide(cookiesStore);
        if(!currentAccount) return (
            <>
            <div className="flex flex-col gap-1 justify-center items-center w-full">
                <h1>Not logged in</h1>
                <Link href={"/auth"}><button className="a">Log in</button></Link>
            </div>
            </>
        );

        const messages = await getMessages({ auth: currentAccount.jwt, instance: currentAccount.instance, creator: person });

        let currentDate = getDayMonth(messages[0].private_message.published);

        return (
            <>
            <div className="flex flex-col gap-4 items-center justify-end max-sm:px-4 w-full px-14 max-sm:max-w-3xl pb-48" >
                <RenderDate date={currentDate} />
                {messages.map((m) => {
                    const date = getDayMonth(m.private_message.published);
                    const isSameDate = date == currentDate;
                    if(!isSameDate) currentDate = date;

                    return (
                        <>
                        {!isSameDate && <RenderDate date={currentDate} />}
                        <div className={` bg-neutral-200 text-neutral-950 rounded-3xl p-4 pb-6 pr-6 relative max-w-sm self-start overflow-ellipsis overflow-clip ${m.creator.name != person && styles.ownMessage}`}>
                            <span className={`absolute right-3 bottom-2 text-neutral-600 ${m.creator.name != person && styles.ownMessageMetadata} font-light italic text-xs`}>{getHoursMinutes(m.private_message.published)}</span>
                            <RenderMarkdown key={m.private_message.id}>{m.private_message.content}</RenderMarkdown>
                        </div>
                        </>
                    )
                })}

            </div>
            <div className="fixed bottom-0 left-0 h-20 w-full bg-neutral-50 dark:bg-neutral-800 border-t border-neutral-400 flex items-center">
                <input className="bg-transparent w-full h-full p-4 outline-none" type="text" name="" id="" />
                <button className=" h-full bg-neutral-50 dark:bg-neutral-800 flex items-center z-10 w-10"><span className="material-symbols-outlined absolute right-5">send</span></button>
            </div>
            </>
        )
    } catch(e) {
        return (
            <RenderError />
        )
    }
}