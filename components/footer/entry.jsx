import ready from '@rbx/core-scripts/util/ready';
import { renderWithErrorBoundary } from '@rbx/core-scripts/react';
import { infoTabHash, accountSettingsPathname } from './src/constants/footerConstants';
import App from './src/App';
import AccountSettingsLanguageSelector from './src/components/AccountSettingsLanguageSelector';

import './src/css/footer.scss';

const rootElementId = 'footer-container';
const accountSettingsLanguageSelectorId = 'account-settings-language-selector';

ready(() => {
  const rootElement = document.getElementById(rootElementId);
  if (rootElement) {
    renderWithErrorBoundary(<App />, rootElement);
  }

  /* add langauge selector on account settings, if mount node is available
   * Note: This change is temporary until account settings page is moved to WebApp
   */
  let accountSettingsMountNode = document.getElementById(accountSettingsLanguageSelectorId);

  let retryAttempts = 10;
  const retryGettingAccountSettingMountNode = () => {
    accountSettingsMountNode = document.getElementById(accountSettingsLanguageSelectorId);
    if (!accountSettingsMountNode && retryAttempts > 0) {
      retryAttempts -= 1;
      setTimeout(retryGettingAccountSettingMountNode, 200);
    } else if (accountSettingsMountNode) {
      renderWithErrorBoundary(<AccountSettingsLanguageSelector />, accountSettingsMountNode);
    }
  };

  // this runs on page load, if user lands on /#info this should render
  retryGettingAccountSettingMountNode();

  /* Angular fix to watch for a tab change and re-render language selector if needed
   * This logic will also take care of case when user doesn't land on /#info first
   */
  if (window.location.pathname.toLowerCase().indexOf(accountSettingsPathname) > -1) {
    window.onhashchange = () => {
      if (window.location.hash === infoTabHash) {
        const newAccountSettingsMountNode = document.getElementById(
          accountSettingsLanguageSelectorId
        );
        if (newAccountSettingsMountNode) {
          renderWithErrorBoundary(<AccountSettingsLanguageSelector />, newAccountSettingsMountNode);
        }
      }
    };
  }
});
