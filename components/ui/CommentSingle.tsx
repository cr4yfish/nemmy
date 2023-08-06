import Image from "next/image";
import { CommentView } from "lemmy-js-client";

import RenderMarkdown from "./RenderMarkdown";
import Username from "../User/Username";
import { DEFAULT_AVATAR } from "@/constants/settings";

import { FormatDate } from "@/utils/formatDate";

export default function CommentSingle({ comment }: { comment: CommentView }) {
  return (
    <>
      <div className="flex flex-col gap-1 border-b border-neutral-300 px-4 pb-4 w-full">
        <div className="flex flex-row flex-wrap items-center">
          <span className="w-fit">
            <Username user={comment.creator} baseUrl="" />
          </span>

          <div className="dividerDot"></div>
          <span className="text-xs text-neutral-400">
            {comment?.community?.name}@
            {new URL(comment?.community?.actor_id).host}
          </span>
          <div className="dividerDot"></div>
          <span className="text-xs text-neutral-400">
            {FormatDate({ date: new Date(comment.comment.published) })}
          </span>
        </div>

        <div>
          <RenderMarkdown content={comment.comment.content} />
        </div>
      </div>
    </>
  );
}
