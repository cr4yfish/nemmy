import ReactMarkdown from "react-markdown"

import styles from "@/styles/util/markdown.module.css"

export default function RenderMarkdown({ 
    children, content, className } : { 
        children?: React.ReactNode, 
        content?: React.ReactNode, 
        className?: string 
    }) {

    return (
        <>
        { (children || content) &&
        <ReactMarkdown className={`${styles.markdown} ${className}`}>
            {`${children || content}`}
        </ReactMarkdown>
        }
        </>
    )
}