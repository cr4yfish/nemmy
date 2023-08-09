import {
  LemmyHttp,
  PrivateMessageView,
  PrivateMessagesResponse,
} from "lemmy-js-client";
import { cookies } from "next/dist/client/components/headers";
import Link from "next/link";

import RenderMarkdown from "@/components/ui/RenderMarkdown";
import { DEFAULT_INSTANCE, DEFAULT_AVATAR } from "@/constants/settings";
import RenderError from "@/components/ui/RenderError";

import { getCurrentAccountServerSide } from "@/utils/authFunctions";

import styles from "@/styles/chat.module.css";
import { getClient } from "@/utils/lemmy";

// Returns all messages from a specific user, sorted by newest message
async function getMessages({
  auth,
  instance,
  creator,
}: {
  auth: string;
  instance: string;
  creator: string;
}): Promise<PrivateMessageView[]> {
  const client = getClient(instance);
  const messages = await client.getPrivateMessages({
    auth: auth,
    page: 1,
    unread_only: false,
  });

  // Get all messages from and to the creator
  const filtered = messages.private_messages.filter(
    (m) => m.creator.name == creator || m.recipient.name == creator,
  );

  // sort by newest message
  filtered
    .sort((a, b) => {
      return (
        new Date(b.private_message.published).getTime() -
        new Date(a.private_message.published).getTime()
      );
    })
    .reverse();

  return filtered;
}

function addZero(n: number) {
  return n < 10 ? `0${n}` : n;
}

function getDayMonth(date: string) {
  const d = new Date(date);
  return `${addZero(d.getDate())}.${addZero(d.getMonth() + 1)}`;
}

function getHoursMinutes(date: string) {
  const d = new Date(date);
  return `${addZero(d.getHours())}:${addZero(d.getMinutes())}`;
}

function RenderDate({ date }: { date: string }) {
  return (
    <>
      <span className="rounded-full bg-neutral-700/10 p-1 px-2 text-xs italic text-neutral-600">
        {date}
      </span>
    </>
  );
}

export default async function UserChat({
  params: { person },
}: {
  params: { person: string };
}) {
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

    const messages = await getMessages({
      auth: currentAccount.instanceAccounts[0]?.jwt,
      instance: currentAccount.instanceAccounts[0]?.instance,
      creator: person,
    });

    let currentDate = getDayMonth(messages[0].private_message.published);

    return (
      <>
        <div className="flex w-full flex-col items-center justify-end gap-4 px-14 pb-48 max-sm:max-w-3xl max-sm:px-4">
          <RenderDate date={currentDate} />
          {messages.map((m) => {
            const date = getDayMonth(m.private_message.published);
            const isSameDate = date == currentDate;
            if (!isSameDate) currentDate = date;

            return (
              <>
                {!isSameDate && <RenderDate date={currentDate} />}
                <div
                  className={` relative max-w-sm self-start overflow-clip overflow-ellipsis rounded-3xl bg-neutral-200 p-4 pb-6 pr-6 text-neutral-950 ${
                    m.creator.name != person && styles.ownMessage
                  }`}
                >
                  <span
                    className={`absolute bottom-2 right-3 text-neutral-600 ${
                      m.creator.name != person && styles.ownMessageMetadata
                    } text-xs font-light italic`}
                  >
                    {getHoursMinutes(m.private_message.published)}
                  </span>
                  <RenderMarkdown
                    key={m.private_message.id}
                    content={m.private_message.content}
                  />
                </div>
              </>
            );
          })}
        </div>
        <div className="fixed bottom-0 left-0 flex h-20 w-full items-center border-t border-neutral-400 bg-neutral-50 dark:bg-neutral-800">
          <input
            className="h-full w-full bg-transparent p-4 outline-none"
            type="text"
            name=""
            id=""
          />
          <button className=" z-10 flex h-full w-10 items-center bg-neutral-50 dark:bg-neutral-800">
            <span className="material-symbols-outlined absolute right-5">
              send
            </span>
          </button>
        </div>
      </>
    );
  } catch (e) {
    return <RenderError />;
  }
}
