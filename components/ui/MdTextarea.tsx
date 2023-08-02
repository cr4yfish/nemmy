"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useState, useRef, useEffect } from "react"

import RenderFormattingOptions from "./RenderFormattingOptions"
import RenderMarkdown from "./RenderMarkdown"

import styles from "@/styles/components/MdTextarea.module.css"

export default function MdTextarea({ 
    defaultValue="", onChange=() => null, readonly=false } : { 
        defaultValue?: string, onChange?: (newText: string) => void, readonly?: boolean }) {

    // these only need to be set, in order to refresh the ref state
    const [selectionStart, setSelectionStart] = useState(0);
    const [selectionEnd, setSelectionEnd] = useState(0);

    const [value, setValue] = useState<string>(defaultValue);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Adjust textarea height to content on user input
    useEffect(() => {
        const textarea = textareaRef.current;

        function adjustHeight() {
        if (!textarea) return;
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
        }

        textarea?.addEventListener("input", adjustHeight);
        adjustHeight();

        // Cleanup on onmount
        return () => {
        textarea?.removeEventListener("input", adjustHeight);
        };
    }, []);

    // manually fire input event on change
    // This is a hack to update the textarea when
    // inserting using markdown formatting options
    useEffect(() => {
        // manually fire input event on change
        textareaRef.current?.dispatchEvent(new Event("input"));
    }, [value])
    // weird react hack to get correct selection index
    useEffect(() => {
        const textarea = textareaRef.current;

        textarea?.addEventListener("selectionchange", () => {
        setSelectionStart(textarea?.selectionStart || 0);
        setSelectionEnd(textarea?.selectionEnd || 0);
        })

        return () => {
        setSelectionStart(textarea?.selectionStart || 0)
        setSelectionEnd(textarea?.selectionEnd || 0)
        }

    }, [textareaRef.current?.selectionStart, textareaRef.current?.selectionEnd])

    useEffect(() => {
        onChange(value);
    }, [value, onChange])

    return (
        <>
        <div className="flex flex-col gap-2">

                <div className="flex w-full flex-row gap-2 overflow-x-auto border-b border-neutral-300 pb-2 max-sm:pb-4">
                  <RenderFormattingOptions 
                    text={value} 
                    setText={(newText: string) => !readonly && setValue(newText)}
                    selectionStart={textareaRef.current?.selectionStart || 0} 
                    selectionEnd={textareaRef.current?.selectionEnd || 0}
                  />
                </div>
                
                <div
                  className={`w-full rounded-lg border border-transparent p-2 dark:bg-neutral-900`}
                >
                  <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => !readonly && setValue(e.currentTarget.value)}
                    name=""
                    id=""
                    style={{ resize: "vertical" }}
                    className={`${styles.textarea}`}
                    placeholder="Tell the world what you think"
                  />
                </div>
                
                <AnimatePresence>
                {value?.length && value.length > 0 && 
                  <motion.h2 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className=" text-lg prose dark:prose-invert">Markdown Preview</motion.h2>
                }
                </AnimatePresence>

                <RenderMarkdown content={value} />
        </div>
        </>
    )
}