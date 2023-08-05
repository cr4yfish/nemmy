import { AnimatePresence, motion } from "framer-motion";

export default function Loader() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={` 
        flex h-44 w-full
        animate-pulse flex-row
        items-start gap-5
        rounded-lg
        bg-neutral-50 p-4
        shadow-md
        dark:bg-neutral-900
        dark:shadow-md
        dark:border-neutral-700
      `} 
      style={{ width: "640px" }}
      key={"loader"}
    >
      <div className="h-20 w-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 max-md:hidden"></div>
      <div className="flex h-full w-full flex-col gap-4">
        <div className="h-4 w-full rounded-lg bg-neutral-200 dark:bg-neutral-800"></div>
        <div className="h-6 w-full rounded-lg bg-neutral-200 dark:bg-neutral-800"></div>
        <div className="h-12 w-full rounded-lg bg-neutral-200 dark:bg-neutral-800"></div>
        <div className=" flex h-6 w-full gap-4">
          <div className="h-full w-12 rounded-lg bg-neutral-200 dark:bg-neutral-800"></div>
          <div className="h-full w-8 rounded-lg bg-neutral-200 dark:bg-neutral-800"></div>
          <div className="h-full w-8 rounded-lg bg-neutral-200 dark:bg-neutral-800"></div>
        </div>
      </div>
    </motion.div>
  );
}
