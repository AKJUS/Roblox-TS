import { eventStreamService } from "@rbx/core-scripts/legacy/core-roblox-utilities";
import EVENT_CONSTANTS from "../constants/eventsConstants";

/**
 * Log event for logout button click
 */
export const sendLogoutButtonClickEvent = (): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    EVENT_CONSTANTS.context.homepage,
    {
      btn: EVENT_CONSTANTS.btn.logout,
    },
  );
};

/**
 * Log event for switchAccount entrypoint button click
 */
export const sendSwitchAccountButtonClickEvent = (url: string): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    EVENT_CONSTANTS.context.homepage,
    {
      btn: EVENT_CONSTANTS.btn.switchAccount,
      state: url,
    },
  );
};

/**
 * Log event for 401 modal shown
 */
export const sendAuth401ModalShownEvent = (): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authPageLoad,
    EVENT_CONSTANTS.context.auth401Modal,
    {},
  );
};

/**
 * Log event for 401 modal sign in button click
 */
export const sendAuth401ModalButtonClickEvent = (): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authButtonClick,
    EVENT_CONSTANTS.context.auth401Modal,
    {
      btn: EVENT_CONSTANTS.btn.signIn,
    },
  );
};

/**
 * Log whether account switcher blob is present or not. Should be logged on page load.
 * @param boolean isBlobPresent
 */
export const sendAccountSwitcherBlobPresentOnPageLoadEvent = (isBlobPresent: boolean): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authPageLoad,
    EVENT_CONSTANTS.context.accountSwitcherStatus,
    {
      state: isBlobPresent.toString(),
    },
  );
};

/**
 * Log authClientError event for cache user changed.
 */
export const sendCacheUserChangedAuthClientErrorEvent = (
  previousUserId: string,
  currentUrl: string,
): void => {
  eventStreamService.sendEventWithTarget(
    EVENT_CONSTANTS.schematizedEventTypes.authClientError,
    EVENT_CONSTANTS.context.cachedUserChanged,
    {
      state: previousUserId,
      url: currentUrl,
    },
  );
};
