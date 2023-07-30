import { Account } from "@/utils/authFunctions";

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
  return (
    <>
      <div className="flex h-full w-full flex-col gap-8 overflow-y-hidden p-20 max-sm:p-4">
        <Section title="Appearance">
          <div className="flex flex-col gap-6">
            <div className="flex w-full flex-row justify-between">
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
  );
}
