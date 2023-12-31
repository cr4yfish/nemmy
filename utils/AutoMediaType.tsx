"use client";
import { useState } from "react";
import Image from "next/image";

const imageExtensions = ["jpg", "jpeg", "png", "webp", "gif"];
const videoExtensions = ["mp4", "webm", "ogg"];

import styles from "@/styles/util/automediatype.module.css";

function NSFWRBlurRender({ defaultState = false }: { defaultState?: boolean }) {
  const [nsfwBlur, setNsfwBlur] = useState(defaultState);
  return (
    <>
      <button
        onClick={() => setNsfwBlur(false)}
        className={`absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center gap-2 duration-200 transition-all ${
          nsfwBlur ? styles.blurOn : styles.blurOff
        }`}
        style={{ zIndex: "10" }}
      >
        {" "}
        <span className="material-symbols-outlined">visibility_off</span>{" "}
        <span>Tap to view NSFW content</span>
      </button>
      <div
        className={`absolute h-full w-full overflow-hidden rounded-lg backdrop-blur-2xl duration-200 transition-all ${
          nsfwBlur ? styles.blurOn : styles.blurOff
        }`}
      ></div>
    </>
  );
}

/**
 * Can Handle both images and videos of various types
 * @param url: string The url of the media
 */
export function AutoMediaType({
  url,
  alt = "",
  nsfw = false,
}: {
  url: string;
  alt?: string;
  nsfw?: boolean;
}) {
  // figure out media type by extension
  const extension = url.split(".").pop();
  if (!extension) throw new Error("No extension found for media");

  // If it's an image, use next/image
  if (imageExtensions.includes(extension)) {
    return (
      <div className="relative" style={{}}>
        {nsfw && <NSFWRBlurRender defaultState={nsfw} />}
        <Image
          src={url}
          alt={alt}
          height={500}
          width={500}
          style={{ width: "100%",  objectFit: "cover" }}
          className=" h-full w-full"
        />
      </div>
    );
  }

  // For video
  else if (videoExtensions.includes(extension)) {
    return (
      <div className="relative">
        {nsfw && <NSFWRBlurRender defaultState={nsfw} />}
        <video src={url} aria-label={alt} controls></video>
      </div>
    );
  }
}

export function isImageType(url: string) {
  const extension = url.split(".").pop();
  if (!extension) throw new Error("No extension found for media");

  return imageExtensions.includes(extension);
}
