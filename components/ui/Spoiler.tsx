"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function Spoiler({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(true);

  return (
    <>
      <button
        onClick={() => setHidden(!hidden)}
        className="relative overflow-visible "
      >
        <AnimatePresence>
          {hidden && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-0 top-0
                            h-full w-full overflow-visible rounded-lg backdrop-blur"
            ></motion.div>
          )}
        </AnimatePresence>
        <span>{children}</span>
      </button>
    </>
  );
}
