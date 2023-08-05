import { AnimatePresence, motion } from "framer-motion";

import { useState } from "react";

type Option = { label: string; icon: string };

function Button({
  option,
  onChange,
}: {
  option: Option;
  onChange?: (newOption: Option) => void;
}) {
  if (!option) {
    console.error("SortButton: option or label not provided", option);
    return null;
  }

  return (
    <>
      <button
        onClick={() => onChange && onChange(option)}
        className={` flex w-full flex-row items-center gap-1 rounded-lg p-2 hover:bg-neutral-50 dark:hover:bg-neutral-700`}
      >
        {<span className={`material-symbols-outlined`}>{option.icon}</span>}
        {option.label}
      </button>
    </>
  );
}

/**
 * Filter between Posts and Comments
 * @param param0
 * @returns
 */
export default function Dropdown({
  onChange,
  options = [],
  defaultOption,
}: {
  options: Option[];
  defaultOption?: Option;
  onChange: (newOption: Option) => void;
}) {
  const [currentOption, setCurrentOption] = useState<Option>(
    defaultOption || options[0],
  );
  const [open, setOpen] = useState(false);

  const onClick = (newOption: Option) => {
    setCurrentOption(newOption);
    onChange(newOption);
    setOpen(false);
  };

  return (
    <div className={`relative`}>
      <button
        onBlur={() => setOpen(false)}
        onClick={() => setOpen(!open)}
        className={`flex flex-row gap-1`}
      >
        <div className="flex flex-row items-center gap-1">
          <span className="material-symbols-outlined">
            {
              options.find((option) => option.label === currentOption.label)
                ?.icon
            }
          </span>
          <span className=" max-xs:hidden">{currentOption.label}</span>
        </div>
        <span className="material-symbols-outlined">expand_more</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onMouseOver={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            className=" 
                        absolute top-full z-50 flex flex-col gap-2
                        rounded-lg border border-fuchsia-500 bg-neutral-50/70 p-2
                        shadow-lg backdrop-blur-xl
                        dark:border-fuchsia-300 dark:bg-neutral-800 dark:shadow-none
                    "
          >
            {options.map((option) => (
              <Button key={option.label} option={option} onChange={onClick} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
