import { LocalUserView, PersonView } from "lemmy-js-client";
import Image from "next/image";

import { DEFAULT_AVATAR } from "@/constants/settings";

import RenderMarkdown from "../ui/RenderMarkdown";

import { FormatNumber } from "@/utils/helpers";

function UserStat({ text, icon }: { text: string; icon: string }) {
    return (
      <>
        <div className={"flex flex-row flex-wrap gap-4 text-xs"}>
          <div className={`flex flex-row items-center gap-1 text-neutral-300 `}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "1rem" }}
            >
              {icon}
            </span>
            <span>{text}</span>
          </div>
        </div>
      </>
    );
  }
  
  import styles from "@/styles/Pages/UserPage.module.css";

export default function UserCard({ userData } : { userData: PersonView }) {

    let post_score = userData?.counts?.post_score;
    let comment_score = userData?.counts?.comment_score;
    let post_count = userData?.counts?.post_count;
    let comment_count = userData?.counts?.comment_count;
  
  
    let karma = Math.ceil(
      ((post_score * 0.9 +
        comment_score * 0.5) /
        (post_count * 0.75 + comment_count * 0.25)) *
        20,
    );

    return (
        <div className={`${styles.userDetails}`}>
        <div
          className="relative z-10 flex w-full flex-col gap-2 overflow-hidden rounded-lg p-4"
          style={{ zIndex: "1" }}
        >
          <div
            className={`${styles.bannerOverlay} absolute left-0 top-0 h-full w-full bg-neutral-900/25 backdrop-blur-sm `}
          ></div>
          {userData?.person?.banner && (
            <Image
              height={200}
              width={500}
              src={userData.person.banner}
              alt=""
              className={`${styles.banner}`}
            />
          )}
          <div className={`${styles.userAvatar}`}>
            <Image
              height={80}
              width={80}
              src={userData?.person?.avatar || DEFAULT_AVATAR}
              alt=""
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-0">
              <h1 className=" text-lg font-bold text-neutral-100">
                {userData?.person?.display_name ||
                  userData.person.name}
              </h1>

              <div className="flex flex-row items-center gap-4 max-sm:text-xs">
                <span className="flex items-center justify-center font-light text-neutral-300">
                  @{userData?.person?.name}
                </span>
              </div>
            </div>
            <div className="flex flex-row items-center">

              {karma > 0 &&
              <>
                <UserStat
                icon="auto_awesome"
                text={FormatNumber(karma, true).toString() + " Points"}
              />
              <div className="dividerDot"></div>
              </>
              }

              

              <UserStat
                icon="cake"
                text={new Date(
                  userData?.person?.published,
                ).toDateString()}
              />
            </div>
          </div>
        </div>
      </div>
    )
}