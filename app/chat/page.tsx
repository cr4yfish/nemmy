import { LemmyHttp, PrivateMessagesResponse } from "lemmy-js-client";
import { cookies } from "next/dist/client/components/headers";
import Link from "next/link";
import Image from "next/image";

import { DEFAULT_AVATAR, DEFAULT_INSTANCE } from "@/constants/settings";

import { FormatDate } from "@/utils/formatDate";

import RenderMarkdown from "@/components/ui/RenderMarkdown";
import RenderError from "@/components/ui/RenderError";
import { getCurrentAccountServerSide } from "@/utils/authFunctions";


async function getChats({ auth, instance} : { auth: string, instance: string }): Promise<PrivateMessagesResponse> {
    try {
        const client = new LemmyHttp(instance ? `https://${instance}` : DEFAULT_INSTANCE);
        const chats = await client.getPrivateMessages({ 
            auth: auth, 
            page: 1,
            unread_only: false,
        });
        return chats;
    } catch(e) {
        console.error(e);
        return {
            private_messages: [],
        }
    }
}

function ChatPreview({creator, chats} : {creator: any, chats: PrivateMessagesResponse}) {
    try {
        const lastMessage = chats?.private_messages?.filter((m) => m.creator.id == creator.id)[0].private_message;
        return (
            <>
            <Link href={`/chat/${creator.name}`} key={creator.id} className="flex flex-row items-center gap-2 w-full bg-fuchsia-100 p-4 rounded-lg cursor-pointer">
                <div className=" h-20 w-20 overflow-hidden rounded-full flex items-center justify-center">
                    <Image height={80} width={80} src={creator.avatar || DEFAULT_AVATAR} alt="" className="w-full h-full object-contain"  />
                </div>
                <div className="flex flex-col w-full">
                    <div className=" w-full flex justify-between">
                        <span className="font-xl font-bold text-fuchsia-950">{creator.name}</span>
                        <span className=" text-xs font-light text-fuchsia-600">{FormatDate({date: new Date(lastMessage.published)})}</span>
                    </div>
                    
                    {/* newest message by creator */}
                    <div className=" text-ellipsis overflow-clip line-clamp-1 font-light text-fuchsia-900 max-w-xs">
                        <RenderMarkdown>{lastMessage.content}</RenderMarkdown>
                    </div>
                </div>
            </Link>
            </>
        )
    } catch(e) {
        console.error(e);
        return (
            <RenderError />
        )
    }
}


export default async function Chat() {
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

        let chats = await getChats({ auth: currentAccount.jwt, instance: currentAccount.instance });
        const recipient = chats.private_messages[0].recipient;

        // filter out all messages that are from the recipient
        chats.private_messages = chats.private_messages.filter((chat) => chat.creator.id != recipient.id);

        // sort chats by newest message
        chats.private_messages.sort((a, b) => {
            const aDate = new Date(a.private_message.published);
            const bDate = new Date(b.private_message.published);
            return bDate.getTime() - aDate.getTime();
        });

        // get all creators in an array (with duplicates)
        const creators = chats.private_messages.map((chat) => chat.creator);

        // remove duplicates
        const uniqueCreators = creators.filter((creator, index) => {
            return creators.findIndex((c) => c.id == creator.id) == index;
        });

        return (
            <>
            <div className="w-full flex flex-col gap-2 max-w-3xl max-sm:px-4">
                {uniqueCreators.map((creator) => (
                    <ChatPreview key={creator.id} creator={creator} chats={chats} />
                ))}
            </div>
            </>
        )
    } catch(e) {
        return (
            <RenderError />
        )
    }
}