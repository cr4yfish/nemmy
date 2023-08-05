"use client"

import { Switch, cn, Checkbox, Input, Card, Button, CardBody, CardHeader, CardFooter } from "@nextui-org/react";
import { AnimatePresence, motion } from "framer-motion";


import { Account } from "@/utils/authFunctions";
import React, { useEffect } from "react";
import { Settings, useSession } from "@/hooks/auth";

function Section({ children, title }: { children: any; title: string }) {
  return (
    <>
      <div className=" flex w-full flex-col gap-2">
        <span className=" w-full text-xs font-bold">{title}</span>
        <div className="flex w-full flex-col rounded-lg bg-neutral-100 p-6 dark:bg-neutral-800 gap-2">
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

  const [instanceForm, setInstanceForm] = React.useState<string>("");

  useEffect(() => {
    if (currentAccount) {
      setSession(prevValue => { return { ...prevValue, settings: settings } })
    }
  }, [settings, currentAccount, setSession])

  const handleBlockInstance = () => {
    setInstanceForm("")
    setSession(prevVal => { return { ...prevVal, settings: { ...prevVal.settings, blockedInstances: [ ...prevVal.settings.blockedInstances, instanceForm ] } }})
  }

  const handleRemoveInstanceBlock = (instance: string) => {
    setSession(prevVal => { return { ...prevVal, settings: { ...prevVal.settings, blockedInstances: [ ...prevVal.settings.blockedInstances.filter((i) => i !== instance) ] } }} ) 
  }

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
                  "justify-between cursor-pointer rounded-lg gap-2 px-4 w-full max-w-full"
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
                  "justify-between cursor-pointer rounded-lg gap-2 px-4 max-w-full"
                ),
              }}
            >
              <div className="flex flex-col gap-1">
                <p className="text-medium">Dark mode</p>
              </div>
            </Switch>


            
          </div>
        </Section>

        <Section title="Instance Blocking">
          
          <Card className="mb-4">
            <CardHeader className="pl-4 pb-0 flex flex-row gap-1"> 
              <span className="material-symbols-outlined text-blue-400" style={{ fontSize: "1rem" }}>info</span>
              <span className=" capitalize text-xs font-bold">Instance Blocking</span>
            </CardHeader>
            <CardBody className="text-xs pt-1">
              You can block whole instances on Nemmy. What this does is it hide any post from an instance which is in the block list.
            </CardBody>
          </Card>


          <div className="flex flex-col gap-1">
            <span className="text-xs">Add an Instance to the block list</span>
            <Input 
              value={instanceForm || ""} 
              onValueChange={(newVal) => newVal && setInstanceForm(newVal)} 
              variant="bordered" label="Instance URL" labelPlacement="inside" 
              endContent={<Button color="primary" onClick={() => handleBlockInstance()} isIconOnly><span className="material-symbols-outlined">add</span></Button>} 
            />
          </div>

          <motion.div className="flex flex-col gap-1">
            <span className="text-xs">Your blocked Instances</span>
            <motion.div >
              <AnimatePresence>
              {session.settings.blockedInstances?.map((instance: string, index: number) => (
                <motion.div key={index} 
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0}} exit={{ opacity: 0, y: -5}}
                  className="flex flex-row justify-between items-center gap-2 p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800"
                  >
                  <span>{instance}</span>
                  <Button onClick={() => handleRemoveInstanceBlock(instance)} color="danger" isIconOnly><span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>delete</span></Button>  
                </motion.div>
              ))}
              </AnimatePresence>
              {((!session.settings.blockedInstances) || session.settings.blockedInstances?.length == 0) &&
              <span className="p-2 text-xs italic text-neutral-400 dark:text-neutral-500">You have no blocked Instances</span>
              }
            </motion.div>
          </motion.div>

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
