import { Account } from "@/utils/authFunctions";

function Section({ children, title }: { children: any, title: string }) {
    return (
        <>
        <div className=" w-full flex flex-col gap-2" >
            <span className=" w-full font-bold text-xs">{title}</span>
            <div className="flex flex-col w-full bg-neutral-200 dark:bg-neutral-800 rounded-lg p-6">{children}</div>
        </div>
        </>
    )
}

export default function SettingsPage({ currentAccount } : { currentAccount: Account }) {
  

    return (
        <>
        <div className="h-full w-full p-20 max-sm:p-4 flex flex-col gap-8 overflow-y-hidden">

            <Section title="Appearance">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-row justify-between w-full">
                        <span>Modern</span>
                        <span>Compact</span>
                    </div>
                    <div>Use system theme</div>
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
    )
}