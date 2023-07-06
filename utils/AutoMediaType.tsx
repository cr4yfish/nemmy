const imageExtensions = ["jpg", "jpeg", "png", "webp", "gif"];
const videoExtensions = ["mp4", "webm", "ogg"];

/**
 * Can Handle both images and videos of various types
 * @param url: string The url of the media
 */
export function AutoMediaType({ url, alt="" } : { url: string, alt?: string }) {
    // figure out media type by extension
    const extension = url.split(".").pop();
    if(!extension) throw new Error("No extension found for media");


    // If it's an image, use next/image
    if(imageExtensions.includes(extension)) {
        return <img src={url} alt={alt} />
    } 
    
    // For video
    else if(videoExtensions.includes(extension)) {
        return <video src={url} aria-label={alt} controls></video>
    }
}

export function isImageType(url: string) {
    const extension = url.split(".").pop();
    if(!extension) throw new Error("No extension found for media");

    return imageExtensions.includes(extension);
}