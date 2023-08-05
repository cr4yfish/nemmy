import { LemmyHttp, PrivateMessagesResponse } from "lemmy-js-client";
import { cookies } from "next/dist/client/components/headers";
import Link from "next/link";
import Image from "next/image";

import { DEFAULT_AVATAR, DEFAULT_INSTANCE } from "@/constants/settings";

import { FormatDate } from "@/utils/formatDate";

import RenderMarkdown from "@/components/ui/RenderMarkdown";
import RenderError from "@/components/ui/RenderError";
import { getCurrentAccountServerSide } from "@/utils/authFunctions";

export const metadata = {
  title: "Chat - Nemmy",
  description: "Chat with other users on Nemmy.",
};

async function getChats({
  auth,
  instance,
}: {
  auth: string;
  instance: string;
}): Promise<PrivateMessagesResponse> {
  try {
    const client = new LemmyHttp(
      instance ? `https://${instance}` : DEFAULT_INSTANCE,
    );
    const chats = await client.getPrivateMessages({
      auth: auth,
      page: 1,
      unread_only: false,
    });
    return chats;
  } catch (e) {
    console.error(e);
    return {
      private_messages: [],
    };
  }
}

function ChatPreview({
  creator,
  chats,
}: {
  creator: any;
  chats: PrivateMessagesResponse;
}) {
  try {
    const lastMessage = chats?.private_messages?.filter(
      (m) => m.creator.id == creator.id,
    )[0].private_message;
    return (
      <>
        <Link
          href={`/chat/${creator.name}`}
          key={creator.id}
          className="flex w-full cursor-pointer flex-row items-center gap-2 rounded-lg bg-fuchsia-100 p-4 dark:bg-neutral-800"
        >
          <div className="flex items-center justify-center overflow-hidden rounded-full">
            <Image
              height={80}
              width={80}
              src={creator.avatar || DEFAULT_AVATAR}
              alt=""
              style={{ height: "80px", width: "80px" }}
              className="h-full w-full overflow-hidden rounded-full object-cover"
            />
          </div>
          <div className="flex w-full flex-col">
            <div className=" flex w-full justify-between">
              <span className="font-xl font-bold text-fuchsia-950 dark:text-fuchsia-200">
                {creator.name}
              </span>
              <span className=" text-xs font-light text-fuchsia-600 dark:text-neutral-400">
                {FormatDate({ date: new Date(lastMessage.published) })}
              </span>
            </div>

            {/* newest message by creator */}
            <div className=" max-w-xs overflow-clip text-ellipsis font-light text-fuchsia-900 line-clamp-1">
              <RenderMarkdown content={lastMessage.content} />
            </div>
          </div>
        </Link>
      </>
    );
  } catch (e) {
    console.error(e);
    return <RenderError />;
  }
}

export default async function Chat() {
  try {
    const cookiesStore = cookies();
    const currentAccount = getCurrentAccountServerSide(cookiesStore);

    if (!currentAccount)
      return (
        <>
          <div className="flex w-full flex-col items-center justify-center gap-1">
            <h1>Not logged in</h1>
            <Link href={"/auth"}>
              <button className="a">Log in</button>
            </Link>
          </div>
        </>
      );

    let chats = await getChats({
      auth: currentAccount.jwt,
      instance: currentAccount.instance,
    });
    const recipient = chats.private_messages[0].recipient;

    // filter out all messages that are from the recipient
    chats.private_messages = chats.private_messages.filter(
      (chat) => chat.creator.id != recipient.id,
    );

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
        <div className="flex w-full max-w-3xl flex-col gap-2 max-sm:px-4">
          {uniqueCreators.map((creator) => (
            <ChatPreview key={creator.id} creator={creator} chats={chats} />
          ))}
        </div>
      </>
    );
  } catch (e) {
    return <RenderError />;
  }
}
