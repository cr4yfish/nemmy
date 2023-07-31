import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

import styles from "@/styles/util/markdown.module.css";

export default function RenderMarkdown({
  content,
  className,
  disableLinks = false,
}: {
  content?: React.ReactNode;
  className?: string;
  disableLinks?: boolean;
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
          components={{
            a ({ node, children, href, ...props }) {
              if(!href) return <span className="a">{children}</span>
              return disableLinks ? (<span className="a">{children}</span>) : (<Link rel="noopener noreferrer" href={href} {...props}>{children}</Link>);
            }
          }}
        >
          {`${content}`}
        </ReactMarkdown>
      )}
    </>
  );
}
