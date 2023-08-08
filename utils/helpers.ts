import { SessionState } from "@/hooks/auth";
import { CommunityView, PostView } from "lemmy-js-client";
import { Dispatch, SetStateAction } from "react";

export function getBufferFromFile(file: File | Blob): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(Buffer.from(event.target.result as ArrayBuffer));
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

export function getBlobFromFile(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(new Blob([event.target.result as ArrayBuffer]));
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Formats numbers to be more eloquent.
 *
 * Can be even more eloquent if you pass the eloquent parameter as true.
 * @param number
 * @param eloquent
 * @returns
 */
export function FormatNumber(
  number: number,
  eloquent: boolean = false,
): string | number {
  if (eloquent) {
    if (number < 1000) return number;
    if (number >= 1000 && number < 1000000)
      return (number / 1000).toFixed(1) + "k";
    if (number >= 1000000 && number < 1000000000)
      return (number / 1000000).toFixed(1) + "m";
  } else {
    return parseInt(number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  }

  return number;
}

export function isTextPost(post: PostView) {
  if (post.post.url) return false;
  if (post.post.thumbnail_url) return false;
  if (post.post.embed_video_url) return false;
  return true;
}

export const getCommunityId = (name: string, actor_id: string) => {
  return `${name}@${new URL(actor_id).host}`;
};

export const handleClickCommunity = (
  community: CommunityView,
  session: SessionState,
  setSession: Dispatch<SetStateAction<SessionState>>,
) => {
  if (
    session.session.selectedCommunities.includes(
      getCommunityId(community.community.name, community.community.actor_id),
    )
  ) {
    deselectCommunity(community, setSession);
  } else {
    selectCommunity(community, setSession);
  }
};

const selectCommunity = (
  community: CommunityView,
  setSession: Dispatch<SetStateAction<SessionState>>,
) => {
  setSession((prevState) => {
    return {
      ...prevState,
      session: {
        ...prevState.session,
        selectedCommunities: [
          ...prevState.session.selectedCommunities,
          getCommunityId(
            community.community.name,
            community.community.actor_id,
          ),
        ],
      },
    };
  });
};

const deselectCommunity = (
  community: CommunityView,
  setSession: Dispatch<SetStateAction<SessionState>>,
) => {
  setSession((prevState) => {
    return {
      ...prevState,
      session: {
        ...prevState.session,
        selectedCommunities: prevState.session.selectedCommunities.filter(
          (c) =>
            c !=
            getCommunityId(
              community.community.name,
              community.community.actor_id,
            ),
        ),
      },
    };
  });
};
