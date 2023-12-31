import {
  ListingType,
  SortType,
  GetSiteResponse,
  CommunityId,
  PostView,
} from "lemmy-js-client";

import PostList from "../PostList";
import SiteInfoCard from "../SiteInfoCard";
import FollowedCommunitiesCard from "../FollowedCommunitiesCard";

import { Account } from "@/utils/authFunctions";

export default function FeedPage({
  fetchParams,
  initPosts,
  instance,
  jwt,
  siteResponse,
  currentAccount,
}: {
  fetchParams?: {
    type_?: ListingType;
    sort?: SortType;
    page?: number;
    limit?: number;
    community_id?: CommunityId;
    community_name?: string;
    saved_only?: boolean;
    auth?: string;
  };
  initPosts?: PostView[];
  instance: string;
  jwt?: string;
  siteResponse: GetSiteResponse | null;
  currentAccount?: Account;
}) {
  return (
    <div className="flex w-full flex-row justify-center gap-2 max-lg:gap-0">
      {currentAccount?.instanceAccounts &&
        currentAccount?.instanceAccounts[0]?.jwt && (
          <div className="mt-16 pt-2">
            <FollowedCommunitiesCard
              siteResponse={siteResponse}
              auth={jwt}
              instance={currentAccount?.instanceAccounts[0]?.instance}
            />
          </div>
        )}

      <PostList
        fetchParams={fetchParams}
        initPosts={initPosts}
        overrideInstance={instance}
      />

      <div className="mt-16 pt-2">
        <SiteInfoCard siteResponse={siteResponse} />
      </div>
    </div>
  );
}
