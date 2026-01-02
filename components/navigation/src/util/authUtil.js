// TODO: old, migrated code
/* eslint-disable no-void */
import angular from "angular";
import { localStorageService } from "@rbx/core-scripts/legacy/core-roblox-utilities";
import { urlService, httpService } from "@rbx/core-scripts/legacy/core-utilities";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { EmailVerificationService, AccountSwitcherService } from "@rbx/core-scripts/legacy/Roblox";
import ExperimentationService from "@rbx/experimentation";
import cacheConstants from "../constants/cacheConstants";
import layoutConstants from "../constants/layoutConstants";
import urlConstants from "../constants/urlConstants";
import { getIntAuthCompliancePolicy } from "../services/complianceService";
import {
  sendCacheUserChangedAuthClientErrorEvent,
  sendLogoutButtonClickEvent,
  sendSwitchAccountButtonClickEvent,
} from "../services/eventService";
import navigationService from "../services/navigationService";

const { getQueryParam, composeQueryString } = urlService;
const {
  getSignupRedirUrl,
  getLoginUrl,
  getNewLoginUrl,
  getHomeUrl,
  getAccountSwitchingSignUpUrl,
  getRefreshSessionUrl,
} = urlConstants;

const { logoutEvent, loginEvent, signupEvent } = layoutConstants;
const VNG_LANDING_LAYER = "Website.LandingPage";
const getReturnUrl = () => {
  // return from the current page if there is no returnUrl param, except it is from login page or the signup page.
  let returnUrl = getQueryParam("returnUrl") || window.location.href;
  returnUrl =
    returnUrl === getLoginUrl() || returnUrl === getAccountSwitchingSignUpUrl() ? "" : returnUrl;
  return returnUrl;
};

const getSignupUrl = (isAccountSwitcherAvailableForBrowser = false) => {
  let returnUrl;
  let signupUrl;
  if (authenticatedUser.isAuthenticated && isAccountSwitcherAvailableForBrowser) {
    returnUrl = getReturnUrl();
    signupUrl = getAccountSwitchingSignUpUrl();
  } else {
    returnUrl = getQueryParam("returnUrl") || window.location.href;

    // Do not add return url if the url points to login page in any way
    const lowerCaseReturnUrl = returnUrl.toLowerCase();
    const doesReturnUrlStartWithLoginUrl =
      lowerCaseReturnUrl.startsWith(getLoginUrl().toLowerCase()) ||
      lowerCaseReturnUrl.startsWith(getNewLoginUrl().toLowerCase());
    returnUrl = doesReturnUrlStartWithLoginUrl ? "" : returnUrl;
    signupUrl = getSignupRedirUrl();
  }
  return `${signupUrl}?${composeQueryString({ returnUrl })}`;
};

const getLoginLinkUrl = () => {
  let returnUrl;
  if (AccountSwitcherService?.isAccountSwitcherAvailable()) {
    returnUrl = getReturnUrl();
  } else {
    // return from the current page if there is no returnUrl param
    returnUrl = getQueryParam("returnUrl") || window.location.href;
  }
  const loginUrl = getLoginUrl();
  return `${loginUrl}?${composeQueryString({ returnUrl })}`;
};

const logoutAndRedirect = () =>
  // TODO: old, migrated code
  // eslint-disable-next-line require-await
  navigationService.logout().then(async () => {
    document.dispatchEvent(new CustomEvent(logoutEvent.name));
    if (!angular.isUndefined(angular.element("#chat-container").scope())) {
      const scope = angular.element("#chat-container").scope();
      scope.$digest(scope.$broadcast("Roblox.Chat.destroyChatCookie"));
    }

    // clear cached user id
    localStorageService.setLocalStorage(cacheConstants.userCacheKey, null);

    // NOTE: we should not delete keyPairs upon logout.
    // TODO: delete CrpytoKey in indexeddb when all users are signed out.
    window.location.reload();
  });

const navigateToLoginWithRedirect = () => {
  window.location.href = getLoginLinkUrl();
};

const logoutUser = e => {
  e.stopPropagation();
  e.preventDefault();
  sendLogoutButtonClickEvent();
  EmailVerificationService?.handleUserEmailUpsellAtLogout(logoutAndRedirect).then(data => {
    // if user is not in test group or has email on file already, logout directly
    if (!data || data.emailAddress) {
      logoutAndRedirect();
    }
  });
};

const refreshCurrentSession = async () => {
  await httpService.post(
    {
      url: getRefreshSessionUrl(),
      withCredentials: true,
    },
    {},
  );
};

// Account Switching
const switchAccount = e => {
  e.stopPropagation();
  e.preventDefault();
  sendSwitchAccountButtonClickEvent(window.location.href);

  // clear cached user id
  localStorageService.setLocalStorage(cacheConstants.userCacheKey, null);

  // destroy chat cookie after account switching
  if (!angular.isUndefined(angular.element("#chat-container").scope())) {
    const scope = angular.element("#chat-container").scope();
    scope.$digest(scope.$broadcast("Roblox.Chat.destroyChatCookie"));
  }

  const containerId = "navigation-account-switcher-container";

  const switchAccountAndGoToHomePage = () => {
    localStorageService.setLocalStorage(
      layoutConstants.accountSwitchConfirmationKeys.accountSwitchedFlag,
      true,
    );
    window.location.href = getHomeUrl();
  };

  const addAccountAndReturnOnSuccess = () => {
    window.location.href = urlConstants.getLoginUrl();
  };

  const AccountSwitcherParameters = {
    containerId,
    onAccountSwitched: switchAccountAndGoToHomePage,
    handleAddAccount: addAccountAndReturnOnSuccess,
  };
  // fire and forget renderAccountSwitcher
  const tryOpenAccountSwitcherModal = async () => {
    if (await AccountSwitcherService?.isAccountSwitcherAvailable()) {
      void AccountSwitcherService?.renderAccountSwitcher(AccountSwitcherParameters);
    }
  };
  tryOpenAccountSwitcherModal();
};

const isLoginLinkAvailable = () => {
  const pathname = typeof window !== "undefined" && window.location ? window.location.pathname : "";
  const currentPath = pathname.toLowerCase() ?? "";

  return !currentPath.startsWith("/login") && !currentPath.startsWith("/newlogin");
};

const getIsVNGLandingRedirectEnabled = async () => {
  try {
    const data = await ExperimentationService.getAllValuesForLayer(VNG_LANDING_LAYER);
    const isIXPEnabled = data?.IsVngLandingPageRedirectEnabled ?? false;
    const { isVNGComplianceEnabled: isFeatureEnabled } = await getIntAuthCompliancePolicy();
    return isFeatureEnabled && isIXPEnabled;
  } catch {
    // fall back to false
    return false;
  }
};

const cacheUserId = () => {
  const currentUserId = window.Roblox?.CurrentUser?.userId ?? null;
  const cachedUserId = localStorageService.getLocalStorage(cacheConstants.userCacheKey) ?? null;
  if (cachedUserId != null && currentUserId != null && cachedUserId !== currentUserId) {
    sendCacheUserChangedAuthClientErrorEvent(
      `${currentUserId},${cachedUserId}`,
      window.location.href,
    );
  }
  localStorageService.setLocalStorage(cacheConstants.userCacheKey, currentUserId);

  // listen for login event
  window.addEventListener(loginEvent.name, e => {
    localStorageService.setLocalStorage(cacheConstants.userCacheKey, e?.detail?.userId);
  });

  // listen for signup event
  window.addEventListener(signupEvent.name, e => {
    localStorageService.setLocalStorage(cacheConstants.userCacheKey, e?.detail?.userId);
  });
};

export {
  getSignupUrl,
  getLoginLinkUrl,
  logoutUser,
  logoutAndRedirect,
  refreshCurrentSession,
  isLoginLinkAvailable,
  switchAccount,
  getIsVNGLandingRedirectEnabled,
  navigateToLoginWithRedirect,
  cacheUserId,
};
