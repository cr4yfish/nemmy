"use client"
import { useState } from "react";

const imageExtensions = ["jpg", "jpeg", "png", "webp", "gif"];
const videoExtensions = ["mp4", "webm", "ogg"];

import styles from "@/styles/util/automediatype.module.css";

function NSFWRBlurRender({ defaultState=false } : { defaultState?: boolean }) {

    const [nsfwBlur, setNsfwBlur] = useState(defaultState);
    return (<>
        <button onClick={() => setNsfwBlur(false)} className={`flex items-center justify-center flex-col gap-2 absolute top-0 left-0 w-full h-full transition-all duration-200 ${nsfwBlur ? styles.blurOn : styles.blurOff}`} style={{ zIndex: "10" }}> <span className="material-symbols-outlined">visibility_off</span> <span>Tap to view NSFW content</span></button>     
        <div className={`absolute w-full h-full backdrop-blur-2xl overflow-hidden rounded-lg transition-all duration-200 ${nsfwBlur ? styles.blurOn : styles.blurOff}`}></div>
    </> )
}

/**
 * Can Handle both images and videos of various types
 * @param url: string The url of the media
 */
export function AutoMediaType({ url, alt="", nsfw=true } : { url: string, alt?: string, nsfw?: boolean }) {
    

    // figure out media type by extension
    const extension = url.split(".").pop();
    if(!extension) throw new Error("No extension found for media");


    // If it's an image, use next/image
    if(imageExtensions.includes(extension)) {
        return <div className="relative">
            <NSFWRBlurRender defaultState={nsfw} />
            <img src={url} alt={alt} />
            </div>
    } 
    
    // For video
    else if(videoExtensions.includes(extension)) {
        return <div className="relative">
            <NSFWRBlurRender defaultState={nsfw} />
            <video src={url} aria-label={alt} controls></video>
            </div>
    }
}

export function isImageType(url: string) {
    const extension = url.split(".").pop();
    if(!extension) throw new Error("No extension found for media");

    return imageExtensions.includes(extension);
}