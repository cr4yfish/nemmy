import { CommentSortType, SortType } from "lemmy-js-client";
import { AnimatePresence, motion } from "framer-motion";

import { useState } from "react";

const iconMap = {
  Active: <span className="active m-2"></span>,
  Hot: <span className="material-symbols-outlined">whatshot</span>,
  New: <span className="material-symbols-outlined">history</span>,
  MostComments: (
    <span className="material-symbols-outlined">arrows_more_up</span>
  ),
};

const iconMapComment = {
  Hot: <span className="material-symbols-outlined">whatshot</span>,
  New: <span className="material-symbols-outlined">hourglass_top</span>,
  Top: <span className="material-symbols-outlined">arrows_more_up</span>,
  Old: <span className="material-symbols-outlined">arrows_more_down</span>,
};

function Button({
  option,
  label,
  icon = undefined,
  replaceIcon = undefined,
  onChange,
  type = "post",
}: {
  option: SortType | CommentSortType;
  label: string;
  icon?: string;
  replaceIcon?: React.ReactNode;
  onChange?: (newOption: SortType | CommentSortType) => void;
  type?: "post" | "comment";
}) {
  if (!option || !label) {
    console.error(
      "SortButton: option or label not provided",
      option,
      label,
      icon,
      replaceIcon,
    );
    return null;
  }

  return (
    <>
      <button
        onClick={() => onChange && onChange(option)}
        className={` flex w-full flex-row items-center gap-1 rounded-lg p-2 hover:bg-neutral-50 dark:hover:bg-neutral-700`}
      >
        {icon && <span className={`material-symbols-outlined`}>{icon}</span>}
        {replaceIcon}
        {label}
      </button>
    </>
  );
}

export default function SortButton({
  onChange,
  type = "post",
  defaultOption,
}: {
  onChange: (newOption: SortType | CommentSortType) => void;
  type?: "post" | "comment";
  defaultOption?: SortType | CommentSortType;
}) {
  const [currentOption, setCurrentOption] = useState<SortType>(
    (defaultOption as SortType) || "Active",
  );
  const [currentOptionComment, setCurrentOptionComment] =
    useState<CommentSortType>((defaultOption as CommentSortType) || "Hot");

  const [open, setOpen] = useState(false);

  const onClick = (newOption: SortType | CommentSortType) => {
    if (type == "post") {
      setCurrentOption(newOption as SortType);
    } else {
      setCurrentOptionComment(newOption as CommentSortType);
    }
    onChange(newOption);
    setOpen(false);
  };

  return (
    <div className={` relative`}>
      <button
        onBlur={() => setOpen(false)}
        onClick={() => setOpen(!open)}
        className={`flex flex-row gap-1`}
      >
        <div className="flex flex-row items-center gap-1">
          {type == "post"
            ? iconMap[
                currentOption as unknown as
                  | "Active"
                  | "Hot"
                  | "New"
                  | "MostComments"
              ]
            : iconMapComment[
                currentOptionComment as unknown as "Hot" | "New" | "Top"
              ]}
          <span>{currentOption}</span>
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
            className=" 
                        absolute top-full z-50 flex flex-col gap-2
                        rounded-lg border border-fuchsia-500 bg-neutral-50/70 p-2
                        shadow-lg backdrop-blur-xl
                        dark:border-fuchsia-300 dark:bg-neutral-800 dark:shadow-none
                    "
          >
            {type == "post" ? (
              <>
                <Button
                  label="Active"
                  option="Active"
                  replaceIcon={<span className="active m-2"></span>}
                  onChange={onClick}
                />

                <Button
                  label="Hot"
                  option="Hot"
                  icon="whatshot"
                  onChange={onClick}
                />

                <Button
                  label="New"
                  option="New"
                  icon="history"
                  onChange={onClick}
                />

                <Button
                  label="Most Comments"
                  option="MostComments"
                  icon="arrows_more_up"
                  onChange={onClick}
                />
              </>
            ) : (
              <>
                <Button
                  label="Hot"
                  option="Hot"
                  icon="whatshot"
                  onChange={onClick}
                />
                <Button
                  label="Top"
                  option="Top"
                  icon="arrow_circle_up"
                  onChange={onClick}
                />
                <Button
                  label="New"
                  option="New"
                  icon="history"
                  onChange={onClick}
                />
                <Button
                  label="Old"
                  option="Old"
                  icon="hourglass_top"
                  onChange={onClick}
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
