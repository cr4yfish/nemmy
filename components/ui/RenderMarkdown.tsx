import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import styles from "@/styles/util/markdown.module.css";

export default function RenderMarkdown({
  content,
  className,
}: {
  content?: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      {content && (
        <ReactMarkdown
          className={`${styles.markdown} ${className}`}
          remarkPlugins={[remarkGfm]}
          remarkRehypeOptions={{
            allowDangerousHtml: true,
            clobberPrefix: "content",
            handlers: {
              a: (h, node) => {
                return h(
                  node,
                  "a",
                  {
                    href: node.properties.href,
                    target: "_blank",
                    rel: "noopener noreferrer",
                  },
                  node.children,
                );
              },
            },
          }}
          components={{}}
        >
          {`${content}`}
        </ReactMarkdown>
      )}
    </>
  );
}
