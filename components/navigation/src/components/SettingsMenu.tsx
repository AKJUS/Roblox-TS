/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import ClassNames from 'classnames';
import { Link } from '@rbx/core-ui/legacy/react-style-guide';
import { AccountSwitcherService } from '@rbx/core-scripts/legacy/Roblox';
import links from '../constants/linkConstants';
import authUtil from '../util/authUtil';
import layoutConstants from '../constants/layoutConstants';

const { settingsUrl, quickLoginUrl } = links;
const { logoutUser, switchAccount } = authUtil;
const { quickLogin, settings, logout, switchAccountKey } = layoutConstants.menuKeys;

interface Props {
  translate: (key: string) => string;
  accountNotificationCount: number;
  isCrossDeviceLoginCodeValidationDisplayed: boolean;
}

function SettingsMenu({
  translate,
  accountNotificationCount = 0,
  isCrossDeviceLoginCodeValidationDisplayed = false
}: Props) {
  const notificationClasses = ClassNames('notification-blue notification nav-setting-highlight', {
    hidden: accountNotificationCount === 0
  });
  const [isAccountSwitchingEnabledForBrowser] =
    AccountSwitcherService.useIsAccountSwitcherAvailableForBrowser();
  const items = Object.entries(settingsUrl).map(([urlKey, { url, label }]) => (
    <li key={urlKey}>
      {urlKey === logout && (
        <Link className="rbx-menu-item logout-menu-item" key={urlKey} onClick={logoutUser} url="#">
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
  ));
  return <React.Fragment>{items}</React.Fragment>;
}

export default SettingsMenu;
