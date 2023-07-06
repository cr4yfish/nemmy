import ReactMarkdown from "react-markdown"

import styles from "@/styles/util/markdown.module.css"

export default function RenderMarkdown({ children } : { children: React.ReactNode }) {
    return (
        <ReactMarkdown className={`${styles.markdown}`}>
            {`${children}`}
        </ReactMarkdown>
    )
}