import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

import Spoiler from "./Spoiler";

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
          className={`prose w-full
          overflow-visible dark:prose-invert prose-headings:mb-1
          prose-p:my-1 prose-a:text-ellipsis prose-a:hyphens-auto
          prose-a:break-all
          prose-img:rounded-lg prose-hr:my-6
          max-sm:prose-p:text-xs ${className}`}
          remarkPlugins={[remarkGfm]}
          remarkRehypeOptions={{
            allowDangerousHtml: true,
            clobberPrefix: "content",
            handlers: {
              a: (h, node) => {
                return h(
                  node,
                  disableLinks ? "span" : "a",
                  {
                    href: node.properties.href,
                    target: "_blank",
                    rel: "noopener noreferrer",
                  },
                  node,
                );
              },
              // render spoilers
              // regex: /:::\sspoiler\s+(?<title>.+)\n(?<body>[\s\S]+?)\n:::/g
              text: (h, node) => {
                let currentValue: string = node.value;
                let newText = "";
                let spoilerEles: any[] = [];
                const spoilerRegex =
                  /:::\sspoiler\s+(?<title>.+)\n(?<body>[\s\S]+?)\n:::/g;
                const matches = currentValue.match(spoilerRegex);

                // Return spoiler
                if (matches && matches?.length > 0) {
                  matches.forEach((match) => {
                    let tmp = match.replace(/::: spoiler spoiler/, ``);
                    tmp = tmp.replace(/:::/, ``);

                    const spoilerEle = h(node, "button", {
                      className: "spoiler",
                      children: tmp,
                    });

                    spoilerEles.push(spoilerEle);
                  });
                }

                return h(
                  node,
                  "span",
                  {
                    children: node.value,
                  },
                  spoilerEles,
                );
              },
            },
          }}
          components={{
            a({ node, children, href, ...props }) {
              if (!href) return <span className="a">{children}</span>;
              return disableLinks ? (
                <span className="a">{children}</span>
              ) : (
                <Link rel="noopener noreferrer" href={href} {...props}>
                  {children}
                </Link>
              );
            },
            button({ node, children, ...props }) {
              if (props.className?.includes("spoiler")) {
                return <Spoiler>{children}</Spoiler>;
              }
              return <button {...props}>{children}</button>;
            },
          }}
        >
          {`${content}`}
        </ReactMarkdown>
      )}
    </>
  );
}
