import { SortType } from "lemmy-js-client"
import { AnimatePresence, motion } from "framer-motion"

import { useState } from "react"

const iconMap = {
    Active: <span className="active m-2"></span>,
    Hot: <span className="material-symbols-outlined">whatshot</span>,
    New: <span className="material-symbols-outlined">history</span>,
    MostComments: <span className="material-symbols-outlined">arrows_more_up</span>
}

function Button({
    option, label, icon=undefined, 
    replaceIcon=undefined, current, onChange
    } : { 
    option: SortType, label: string, icon?: string, 
    replaceIcon?: React.ReactNode, current: SortType,
    onChange?: (newOption: SortType) => void
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

export default function SortButton({ onChange }: { onChange: (newOption: SortType) => void }) {
    const [currentOption, setCurrentOption] = useState<SortType>("Active")
    const [open, setOpen] = useState(false)

    const onClick = (newOption: SortType) => {
        setCurrentOption(newOption)
        onChange(newOption)
        setOpen(false)
    }

    return (
    <div className={``}>

        <button onClick={() => setOpen(!open)} className={`flex flex-row gap-1`}>
            <div className="flex flex-row items-center gap-1">
                {iconMap[(currentOption as unknown as "Active" | "Hot" | "New" | "MostComments")]}
                <span>{currentOption}</span>
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
                    className=" 
                        absolute top-full z-50 backdrop-blur-xl p-2 rounded-lg
                        bg-neutral-50/70 dark:bg-zinc-800 border border-fuchsia-500 dark:border-fuchsia-300
                        shadow-lg dark:shadow-none
                        flex flex-col gap-2
                    ">
                    <Button label="Active" option="Active" replaceIcon={<span className="active m-2"></span>}
                            current={currentOption} onChange={onClick}
                    />

                    <Button label="Hot" option="Hot" icon="whatshot" 
                            current={currentOption} onChange={onClick}
                    />

                    <Button label="New" option="New" icon="history"
                            current={currentOption} onChange={onClick}
                    />

                    <Button label="Most Comments" option="MostComments" icon="arrows_more_up" 
                            current={currentOption} onChange={onClick}
                    />
                </motion.div>
            }
        </AnimatePresence>
    </div>
    )
}