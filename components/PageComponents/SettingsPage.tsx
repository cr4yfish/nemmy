"use client"

import { Switch, cn, Checkbox } from "@nextui-org/react";


import { Account } from "@/utils/authFunctions";
import React, { useEffect } from "react";
import { Settings, useSession } from "@/hooks/auth";

function Section({ children, title }: { children: any; title: string }) {
  return (
    <>
      <div className=" flex w-full flex-col gap-2">
        <span className=" w-full text-xs font-bold">{title}</span>
        <div className="flex w-full flex-col rounded-lg bg-neutral-200 p-6 dark:bg-neutral-800">
          {children}
        </div>
      </div>
    </>
  );
}

export default function SettingsPage({
  currentAccount,
}: {
  currentAccount: Account;
}) {

  const { session, setSession } = useSession()
  const [settings, setSettings] = React.useState<Settings>(currentAccount.settings || {} as Settings)

  useEffect(() => {
    if (currentAccount) {
      setSession(prevValue => { return { ...prevValue, settings: settings } })
    }
  }, [settings, currentAccount, setSession])

  return (
    <>
      <div className="flex h-full w-full flex-col gap-8 overflow-y-hidden p-20 max-sm:p-4">
        <Section title="Appearance">
          <div className="flex flex-col gap-6">

            <div className="flex w-full flex-row justify-between items-start">

              <div className="flex flex-col items-center gap-2">

                <button onClick={() =>  setSettings(prevValue => { return { ...prevValue, cardType: "modern" }})} className=" bg-neutral-400 dark:bg-neutral-600 rounded-lg flex flex-col overflow-hidden gap-2 p-1" style={{ width: "50px", height: "100px" }}>
                  <div className=" w-full h-9 bg-neutral-600 dark:bg-neutral-400 rounded-sm "></div>
                  <div className=" w-full h-9 bg-neutral-600 dark:bg-neutral-400 rounded-sm"></div>
                  <div className=" w-full h-9 bg-neutral-600 dark:bg-neutral-400 rounded-sm"></div>
                </button>

                <Checkbox 
                  radius="full" 
                  defaultChecked={settings.cardType == "modern" || false} isSelected={settings.cardType == "modern" || false}
                  onValueChange={(isSelected) => setSettings(prevValue => { return { ...prevValue, cardType: isSelected ? "modern" : "modern"}})}>
                    Modern
                </Checkbox>
              </div>

              <div className="flex flex-col items-center justify-center gap-2">

                <button onClick={() =>  setSettings(prevValue => { return { ...prevValue, cardType: "auto" }})} className=" bg-neutral-400 dark:bg-neutral-600 rounded-lg flex flex-col overflow-hidden gap-2 p-1" style={{ width: "50px", height: "100px" }}>
                  <div className=" w-full h-9 bg-neutral-600 dark:bg-neutral-400 rounded-sm "></div>
                  <div className=" w-full h-4 bg-neutral-600 dark:bg-neutral-400 rounded-sm"></div>
                  <div className=" w-full h-9 bg-neutral-600 dark:bg-neutral-400 rounded-sm"></div>
                </button>

                <Checkbox 
                  radius="full" 
                  defaultChecked={settings.cardType == "auto" || false} isSelected={settings.cardType == "auto" || false} 
                  onValueChange={(isSelected) => setSettings(prevValue => { return { ...prevValue, cardType: isSelected ? "auto" : "auto"}})}>
                    Auto
                </Checkbox>
              </div>

              
              <div className="flex flex-col items-center  gap-2">

                <button onClick={() =>  setSettings(prevValue => { return { ...prevValue, cardType: "compact" }})} className=" bg-neutral-400 dark:bg-neutral-600 rounded-lg flex flex-col overflow-hidden gap-2 p-1" style={{ width: "50px", height: "100px" }}>
                  <div className=" w-full h-4 bg-neutral-600 dark:bg-neutral-400 rounded-sm "></div>
                  <div className=" w-full h-4 bg-neutral-600 dark:bg-neutral-400 rounded-sm"></div>
                  <div className=" w-full h-4 bg-neutral-600 dark:bg-neutral-400 rounded-sm"></div>
                  <div className=" w-full h-4 bg-neutral-600 dark:bg-neutral-400 rounded-sm"></div>
                </button>
                
                <Checkbox 
                  radius="full" 
                  defaultChecked={settings.cardType == "compact" || false} 
                  isSelected={settings.cardType == "compact" || false} 
                  onValueChange={(isSelected) => setSettings(prevValue => { return { ...prevValue, cardType: isSelected ? "compact" : "compact"}})}>
                    Compact
                  </Checkbox>
              </div>
            </div>


            <Switch
              defaultSelected={settings.useSystemTheme || false}
              isSelected={settings.useSystemTheme || false}
              onValueChange={(value) => setSettings({ ...settings, useSystemTheme: value })}
              classNames={{
                base: cn(
                  "inline-flex flex-row-reverse w-full max-w-md items-center",
                  "justify-between cursor-pointer rounded-lg gap-2 px-4"
                ),
              }}
            >
              <div className="flex flex-col gap-1">
                <p className="text-medium">Use System theme</p>
              </div>
            </Switch>

            <Switch
              startContent={<div className=" h-full flex items-center justify-center"><span className="material-symbols-outlined h-full flex items-center " style={{ fontSize: "1rem" }}>light_mode</span></div>}
              endContent={<div className="h-full flex justify-center items-center"><span className="material-symbols-outlined h-full flex items-center" style={{ fontSize: "1rem" }}>dark_mode</span></div>}
              isDisabled={settings.useSystemTheme || false}
              defaultSelected={settings.theme === "dark" || false}
              isSelected={settings.theme === "dark" || false}
              onValueChange={(value) => setSettings({ ...settings, theme: value ? "dark" : "light" })}
              classNames={{
                base: cn(
                  "inline-flex flex-row-reverse w-full max-w-md items-center",
                  "justify-between cursor-pointer rounded-lg gap-2 px-4"
                ),
              }}
            >
              <div className="flex flex-col gap-1">
                <p className="text-medium">Dark mode</p>
              </div>
            </Switch>


            
          </div>
        </Section>

        <Section title="Textsize">
          <div className="flex flex-col gap-4">
            <div>Small</div>
            <div>Regular</div>
            <div>Big</div>
          </div>
        </Section>
      </div>
    </>
  );
}
