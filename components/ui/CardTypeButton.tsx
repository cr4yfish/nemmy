import { Dropdown, DropdownTrigger, Button, DropdownMenu, DropdownItem } from "@nextui-org/react";

import { useSession } from "@/hooks/auth";

export default function CardTypeButton() {
    const { session, setSession } = useSession();

    return (
    <Dropdown showArrow className=" text-neutral-700 ">
        <DropdownTrigger>
          <Button variant="bordered" style={{ height: "43.3px" }} className=" text-neutral-700 ">
            <span className="material-symbols-outlined">
              {session.settings.cardType == "auto" && "auto_awesome"}
              {session.settings.cardType == "modern" && "view_agenda"}
              {session.settings.cardType == "compact" && "view_list"}
            </span>
            <span className="capitalize max-sm:hidden">
              {session.settings.cardType}
            </span>
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          variant="faded"
          onAction={(newKey) =>
            setSession((prevValue) => {
              return {
                ...prevValue,
                settings: {
                  ...prevValue.settings,
                  cardType: newKey as "auto" | "modern" | "compact",
                },
              };
            })
          }
        >
          <DropdownItem
            key={"auto"}
            startContent={
              <span className=" material-symbols-outlined">auto_awesome</span>
            }
          >
            Auto
          </DropdownItem>
          <DropdownItem
            key={"modern"}
            startContent={
              <span className=" material-symbols-outlined">view_agenda</span>
            }
          >
            Modern
          </DropdownItem>
          <DropdownItem
            key={"compact"}
            startContent={
              <span className=" material-symbols-outlined">view_list</span>
            }
          >
            Compact
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )
}