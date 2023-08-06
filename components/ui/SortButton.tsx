import { CommentSortType, SortType } from "lemmy-js-client";
import { AnimatePresence, motion } from "framer-motion";

import { useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
} from "@nextui-org/react";

type Option = { label: string; key: string; icon: string };
type Section = { title: string; options: Option[] };

export default function SortButton({
  current,
  setCurrent,
  sections = [],
}: {
  current: string;
  setCurrent: Function;
  sections: Section[];
}) {
  return (
    <Dropdown showArrow shadow="sm">
      <DropdownTrigger>
        <Button variant="bordered" style={{ height: "43.3px" }}>
          {current}
          <span className="material-symbols-outlined text-sm">expand_more</span>
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        variant="faded"
        onAction={(key) => setCurrent(key as string)}
      >
        {sections.map((section, index) => (
          <DropdownSection key={index} title={section.title}>
            {section.options.map((option) => (
              <DropdownItem
                key={option.key}
                startContent={
                  <span className="material-symbols-outlined">
                    {option.icon}
                  </span>
                }
              >
                {option.label}
              </DropdownItem>
            ))}
          </DropdownSection>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
