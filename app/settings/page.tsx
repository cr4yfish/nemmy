import { GetSiteResponse, LemmyHttp } from "lemmy-js-client";
import { cookies } from "next/dist/client/components/headers";

import { DEFAULT_INSTANCE } from "@/constants/settings";

import { getCurrentAccountServerSide } from "@/utils/authFunctions";

import SettingsPage from "@/components/PageComponents/SettingsPage";

export const metadata = {
  title: "Settings - Nemmy",
  description: "Change your settings on Nemmy.",
};

export default async function Settings() {
  const cookieStore = cookies();
  const currentAccount = getCurrentAccountServerSide(cookieStore);

  if (!currentAccount) {
    return (
      <>
        <div className="flex h-full w-full flex-col gap-8 overflow-y-hidden p-20 max-sm:p-4">
          <div className="flex flex-col gap-6">
            <div className="flex w-full flex-row justify-between">
              <span>Modern</span>
              <span>Compact</span>
            </div>


            <div>Use system theme</div>
            
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SettingsPage currentAccount={currentAccount} />
    </>
  );
}
