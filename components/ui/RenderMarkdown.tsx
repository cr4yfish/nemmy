import ReactMarkdown from "react-markdown"

import styles from "@/styles/util/markdown.module.css"

export default function RenderMarkdown({ children, content } : { children?: React.ReactNode, content?: React.ReactNode }) {
    return (
        <ReactMarkdown className={`${styles.markdown}`}>
            {`${children || content}`}
        </ReactMarkdown>
    )
}