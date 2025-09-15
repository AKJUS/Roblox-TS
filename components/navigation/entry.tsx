import ready from '@rbx/core-scripts/util/ready';
import { renderWithErrorBoundary } from '@rbx/core-scripts/react';
import { addLegacyExternal } from '@rbx/externals';
import LeftNavigation from './src/containers/LeftNavigation';
import NavigationRightHeader from './src/containers/NavigationRightHeader';
import NavigationRobux from './src/containers/NavigationRobux';
import authUtil from './src/util/authUtil';
import developUtil from './src/util/developUtil';
import MenuIcon from './src/containers/MenuIcon';
import { translations } from './component.json';

import './src/main.css';
import './src/css/navigation.scss';

const rightNavigationHeaderContainerId = 'right-navigation-header';
const leftNavigationContainerId = 'left-navigation-container';
const menuIconContainerId = 'header-menu-icon';
const navigationRobuxContainerId = 'navigation-robux-container';
const navigationRobuxMobileContainerId = 'navigation-robux-mobile-container';

const {
  logoutAndRedirect,
  getIsVNGLandingRedirectEnabled,
  navigateToLoginWithRedirect,
  getSignupUrl
} = authUtil;
// expose navigation service to external apps
// if adding new values, be careful previous ones aren't overridden
// TODO: it has been used for verificaitionUpsellModal, ContactMethodPrompt.jsx
// TODO: from Roblox.Authentication.WebApp, once that app is migrated to workspace,
// TODO: we can apply import package pattern instead of legacy external
interface NavigationServiceType {
  logoutAndRedirect: typeof logoutAndRedirect;
  getIsVNGLandingRedirectEnabled: typeof getIsVNGLandingRedirectEnabled;
  navigateToLoginWithRedirect: typeof navigateToLoginWithRedirect;
  getSignupUrl: typeof getSignupUrl;
}

const NavigationService: NavigationServiceType = {
  logoutAndRedirect,
  getIsVNGLandingRedirectEnabled,
  navigateToLoginWithRedirect,
  getSignupUrl
};
addLegacyExternal(['Roblox', 'NavigationService'], NavigationService);
authUtil.cacheUserId();
developUtil.initializeDevelopLink();

// The anchor html elements lives in navigation.html
// Mounting components seperatly to avoid hydrating
// components that do not need to be server rendered.
ready(() => {
  if (document.getElementById(menuIconContainerId)) {
    renderWithErrorBoundary(<MenuIcon />, document.getElementById(menuIconContainerId));
  }

  if (document.getElementById(navigationRobuxContainerId)) {
    renderWithErrorBoundary(
      <NavigationRobux translate={translations} />,
      document.getElementById(navigationRobuxContainerId)
    );
  }

  if (document.getElementById(navigationRobuxMobileContainerId)) {
    renderWithErrorBoundary(
      <NavigationRobux translate={translations} />,
      document.getElementById(navigationRobuxMobileContainerId)
    );
  }

  if (document.getElementById(rightNavigationHeaderContainerId)) {
    renderWithErrorBoundary(
      <NavigationRightHeader />,
      document.getElementById(rightNavigationHeaderContainerId)
    );
  }

  if (document.getElementById(leftNavigationContainerId)) {
    renderWithErrorBoundary(<LeftNavigation />, document.getElementById(leftNavigationContainerId));
  }
});
