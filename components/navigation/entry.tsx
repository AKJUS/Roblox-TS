import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";
import { addExternal } from "@rbx/externals";
import LeftNavigation from "./src/containers/LeftNavigation";
import NavigationRightHeader from "./src/containers/NavigationRightHeader";
import NavigationRobux from "./src/containers/NavigationRobux";
import { cacheUserId } from "./src/util/authUtil";
import developUtil from "./src/util/developUtil";
import MenuIcon from "./src/containers/MenuIcon";
import setupAuthInterceptor from "./src/services/authInterceptor";
import * as navigation from "./src";
import { translations } from "./component.json";

import "./src/main.css";
import "./src/css/navigation.scss";

const rightNavigationHeaderContainerId = "right-navigation-header";
const leftNavigationContainerId = "left-navigation-container";
const menuIconContainerId = "header-menu-icon";
const navigationRobuxContainerId = "navigation-robux-container";
const navigationRobuxMobileContainerId = "navigation-robux-mobile-container";

addExternal(["Roblox", "NavigationService"], { ...navigation });
cacheUserId();
developUtil.initializeDevelopLink();

// Setup HTTP interceptor to listen for 401 auth codes
setupAuthInterceptor();

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
      document.getElementById(navigationRobuxContainerId),
    );
  }

  if (document.getElementById(navigationRobuxMobileContainerId)) {
    renderWithErrorBoundary(
      <NavigationRobux translate={translations} />,
      document.getElementById(navigationRobuxMobileContainerId),
    );
  }

  if (document.getElementById(rightNavigationHeaderContainerId)) {
    renderWithErrorBoundary(
      <NavigationRightHeader />,
      document.getElementById(rightNavigationHeaderContainerId),
    );
  }

  if (document.getElementById(leftNavigationContainerId)) {
    renderWithErrorBoundary(<LeftNavigation />, document.getElementById(leftNavigationContainerId));
  }
});
