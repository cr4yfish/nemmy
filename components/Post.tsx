import Image from "next/image";


import { PostView } from "lemmy-js-client";
import Username from "./User/Username";


import styles from "../styles/post.module.css"

/**
 * Can Handle both images and videos of various types
 * @param url: string The url of the media
 */
function AutoMediaType({ url, alt="" } : { url: string, alt?: string }) {
    // figure out media type by extension
    const extension = url.split(".").pop();
    if(!extension) throw new Error("No extension found for media");

    const imageExtensions = ["jpg", "jpeg", "png", "webp"];
    const otherImageExtensions = [""];
    const videoExtensions = ["mp4", "webm", "ogg", "gif"];

    // If it's an image, use next/image
    if(imageExtensions.includes(extension)) {
        return <img src={url} alt={alt} />
    } 
    
    // For video
    else if(videoExtensions.includes(extension)) {
        return <video src={url} aria-label={alt} controls></video>
    }
}

export default function Post({ post } : { post: PostView }) {

    if(!post) throw new Error("Post is undefined");

    const hasMedia = post.post.embed_video_url || post.post.thumbnail_url;

    const baseUrl = new URL(post.community.actor_id).hostname;
    // https://lemmy.ml/post/1681855
    const postUrl = `https://${baseUrl}/post/${post.post.id}`;

    const wrapperProps = {
        ...(!hasMedia && { href: postUrl, target: "_blank" })
    }

    return (
        <>
        <a 
            className={`${styles.wrapper}`} key={post.post.id} 
            style={{ height: !hasMedia ? "fit-content" : "unset", cursor: hasMedia ? "unset" : "pointer" }}
            {...wrapperProps}
        >
            <div className={`${styles.votes}`}>
                <span className={`material-icons ${styles.upvote}`}>arrow_upward</span>
                <span className={`${styles.votesCount}`}>{post.counts.score}</span>
                <span className={`material-icons ${styles.downvote}`}>arrow_downward</span>
            </div>

            <div className={`${styles.rightSide}`}>

                <a className={`${styles.header}`} href={postUrl} target="_blank">
                    <div className={`${styles.votes}`}></div>
                    <div className={`${styles.headerContent}`}>
                        <div className={`${styles.headerMetadata}`}>
                            <div className={`${styles.communityImage}`}>
                                <img src={post.community.icon} alt={post.community.name} height={20} width={20} />
                            </div>
                            <span className={`${styles.sub}`}>c/{post.community.name}</span>
                            <span className={`${styles.user}`}>
                                <div>Posted by</div> 
                                <Username user={post.creator} baseUrl={baseUrl} /> 
                                <div>on {new Date(post.post.published).toDateString()}</div>
                            </span>
                        </div>
                        <div className={`${styles.headerTitle}`}>
                            <h2 className={`${styles.title}`}>{post.post.name}</h2>
                            <span className={`${styles.flair}`}></span>
                        </div>
                        <span className={`${styles.headerLink}`}></span>
                    </div>
                </a>
                <div className={`${styles.content}`}>
                    <div className={`${styles.contentOverlay}`} style={{ display: hasMedia ? "none" : "block" }}></div>
                    <div className={`${styles.body}`}>{post.post.body}</div> 
                    {post.post.embed_video_url &&
                        <div className={`${styles.video}`}>
                            <AutoMediaType url={post.post.embed_video_url} alt={post.post.name} />
                        </div>
                    }
                    {post.post.thumbnail_url &&
                        <a className={`${styles.image}`} href={post.post.thumbnail_url} target="_blank">
                            <AutoMediaType url={post.post.thumbnail_url} alt={post.post.name} />
                        </a>
                    }
                </div>
                <div className={styles.footer}>
                    <div><span className="material-icons">chat</span> 2 Comments</div>
                    <div><span className="material-icons">share</span> Share</div>
                    <div><span className="material-icons">bookmark</span> Save</div>
                    <div><span className="material-icons">more_horiz</span></div>
                </div>
            </div>

        </a>
        </>
    )
}