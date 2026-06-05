import React from "react";
import ClassNames from "classnames";
import { QueryClientProvider, useMutation } from "@tanstack/react-query";
import { queryClient } from "@rbx/core-scripts/react";
import { Link } from "@rbx/core-ui/legacy/react-style-guide";
import { AccountSwitcherService } from "@rbx/core-scripts/legacy/Roblox";
import links from "../constants/linkConstants";
import { logoutUser, switchAccount } from "../util/authUtil";
import layoutConstants from "../constants/layoutConstants";

const { settingsUrl, quickLoginUrl } = links;
const { quickLogin, settings, logout, switchAccountKey } = layoutConstants.menuKeys;

interface Props {
  translate: (key: string) => string;
  accountNotificationCount: number;
  isCrossDeviceLoginCodeValidationDisplayed: boolean;
}

function SettingsMenuItems({
  translate,
  accountNotificationCount = 0,
  isCrossDeviceLoginCodeValidationDisplayed = false,
}: Props) {
  const notificationClasses = ClassNames("notification-blue notification nav-setting-highlight", {
    hidden: accountNotificationCount === 0,
  });
  const [isAccountSwitchingEnabledForBrowser] =
    AccountSwitcherService.useIsAccountSwitcherAvailableForBrowser();
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await logoutUser();
    },
  });
  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (logoutMutation.isPending) return;
    logoutMutation.mutate(undefined);
  };
  return (
    <React.Fragment>
      {Object.entries(settingsUrl).map(([urlKey, { url, label }]) => (
        <li key={urlKey}>
          {urlKey === logout && (
            <Link
              className="rbx-menu-item logout-menu-item"
              key={urlKey}
              onClick={handleLogoutClick}
              url="#"
            >
              {translate(label)}
            </Link>
          )}
          {urlKey === switchAccountKey && isAccountSwitchingEnabledForBrowser && (
            <Link
              className="rbx-menu-item account-switch-menu-item"
              key={urlKey}
              onClick={switchAccount}
              url="#"
            >
              {translate(label)}
            </Link>
          )}
          {urlKey === quickLogin && isCrossDeviceLoginCodeValidationDisplayed && (
            <Link className="rbx-menu-item" key={urlKey} url={quickLoginUrl}>
              {translate(label)}
            </Link>
          )}
          {urlKey !== logout && urlKey !== quickLogin && urlKey !== switchAccountKey && (
            <Link cssClasses="rbx-menu-item" key={urlKey} url={url}>
              {translate(label)}
              {urlKey === settings && (
                <span className={notificationClasses}>{accountNotificationCount}</span>
              )}
            </Link>
          )}
        </li>
      ))}
    </React.Fragment>
  );
}

function SettingsMenu(props: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsMenuItems {...props} />
    </QueryClientProvider>
  );
}

export default SettingsMenu;
