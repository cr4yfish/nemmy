import { SortType } from "lemmy-js-client"
import { AnimatePresence, motion } from "framer-motion"

import { useState } from "react"

export type FilterType = "Posts" | "Comments" | "SavedOnly"

const iconMap = {
    Posts: <span className="material-symbols-outlined">auto_awesome_motion</span>,
    Comments: <span className="material-symbols-outlined">comment</span>,
    SavedOnly: <span className="material-symbols-outlined">bookmark</span>
}

function Button({
    option, label, icon=undefined, 
    replaceIcon=undefined, current, onChange
    } : { 
    option: FilterType, label: string, icon?: string, 
    replaceIcon?: React.ReactNode, current: FilterType,
    onChange?: (newOption: FilterType) => void
}) {
    if(!option || !label) {
        console.error("SortButton: option or label not provided", option, label, icon, replaceIcon )
        return null
    };

    const isCurrent = current === option;

    return (
        <>
            <button 
                onClick={() => onChange && onChange(option)}
                className={` w-full flex flex-row gap-1 items-center hover:bg-neutral-50 p-2 rounded-lg`}>
                    {icon && <span className={`material-symbols-outlined`}>{icon}</span>}
                    {replaceIcon}
                    {label}
            </button>
        </>
    )
}

/**
 * Filter between Posts and Comments
 * @param param0 
 * @returns 
 */
export default function FilterButton({ onChange }: { onChange: (newOption: FilterType) => void }) {
    const [currentOption, setCurrentOption] = useState<FilterType>("Posts")
    const [open, setOpen] = useState(false)

    const onClick = (newOption: FilterType) => {
        setCurrentOption(newOption)
        onChange(newOption)
        setOpen(false)
    }

    return (
    <div className={``}>

        <button onBlur={() => setOpen(false)} onClick={() => setOpen(!open)} className={`flex flex-row gap-1`}>
            <div className="flex flex-row items-center gap-1">
                {iconMap[(currentOption as unknown as FilterType )]}
                <span className=" max-xs:hidden">{currentOption}</span>
            </div>
            <span className="material-icons">expand_more</span>
        </button>

        <AnimatePresence>
            { open &&
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onMouseOver={() => setOpen(true)}
                    onMouseLeave={() => setOpen(false)}
                    onBlur={() => setOpen(false)}
                    onFocus={() => setOpen(true)}
                    className=" 
                        absolute top-full z-50 backdrop-blur-xl p-2 rounded-lg
                        bg-neutral-50/70 dark:bg-zinc-800 border border-fuchsia-500 dark:border-fuchsia-300
                        shadow-lg dark:shadow-none
                        flex flex-col gap-2
                    ">
                    <Button label="Posts" option="Posts" icon="auto_awesome_motion"
                            current={currentOption} onChange={onClick}
                    />

                    <Button label="Comments" option="Comments" icon="comment" 
                            current={currentOption} onChange={onClick}
                    />

                    <Button label="Saved Only" option="SavedOnly" icon="bookmark" 
                            current={currentOption} onChange={onClick}
                    />

                </motion.div>
            }
        </AnimatePresence>
    </div>
    )
}