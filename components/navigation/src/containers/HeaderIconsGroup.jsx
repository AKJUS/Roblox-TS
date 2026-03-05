// Since the notification stream is angularjs code, the notification-stream-indicator below is for
// notification stream code to engage with navigation component
/* eslint-disable react/no-unknown-property */
import { useState, useEffect } from "react";
import angular from "angular";
import PropTypes from "prop-types";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { withTranslations } from "@rbx/core-scripts/react";
import { createSystemFeedback } from "@rbx/core-ui/legacy/react-style-guide";
import { localStorageService } from "@rbx/core-scripts/legacy/core-roblox-utilities";
import navigationService from "../services/navigationService";
import NotificationStreamPopover from "../components/NotificationStreamPopover";
import SettingsPopover from "../components/SettingsPopover";
import BuyRobuxPopover from "../components/robux-popover/BuyRobuxPopover";
import UniverseSearchIcon from "../components/UniverseSearchIcon";
import navigationUtil from "../util/navigationUtil";
import AgeBracketDisplay from "../components/AgeBracketDisplay";
import { translations } from "../../component.json";
import layoutConstants from "../constants/layoutConstants";
import { shouldShowRobuxUpdateBadge } from "../util/robuxBadgeUtil";

const { getAccountNotificationCount } = navigationUtil;
const [SystemFeedback, systemFeedbackService] = createSystemFeedback();

function HeaderIconsGroup({ translate, toggleUniverseSearch }) {
  const { isAuthenticated, id: userId } = authenticatedUser;
  const [accountNotificationCount, setAccountNotificationCount] = useState(0);
  const [isGetCurrencyCallDone, setGetCurrencyCallDone] = useState(false);
  const [robuxAmount, setRobuxAmount] = useState(0);
  const [isEligibleForVng, setIsEligibleForVng] = useState(false);
  const [canAccessStream, setCanAccessStream] = useState(true);
  const [robuxBadgeType, setRobuxBadgeType] = useState(null);
  const [robuxError, setRobuxError] = useState("");
  const [creditDisplayConfig, setCreditDisplayConfig] = useState(
    layoutConstants.creditDisplayConfigVariants.control,
  );
  const [creditAmount, setCreditAmount] = useState(null);
  const [currencyCode, setCurrencyCode] = useState(null);
  const [creditError, setCreditError] = useState("");
  // wait for experiment to load before loading Robux wallet icons
  const [isExperimentCallDone, setIsExperimentCallDone] = useState(false);

  const getUserCurrency = () => {
    if (isAuthenticated) {
      setGetCurrencyCallDone(false);
      // Set Robux amount
      navigationService
        .getUserCurrency(userId)
        .then(
          ({ data: usercurrencyData }) => {
            setRobuxAmount(usercurrencyData.robux);
          },
          () => {
            const untranslatedMessage = layoutConstants.economySystemOutageMessage;
            const translatedMessage = translate(untranslatedMessage);
            setRobuxError(translatedMessage || untranslatedMessage);
          },
        )
        .finally(() => {
          setGetCurrencyCallDone(true);
        });
    }
  };
  const getVngMetadata = () => {
    if (isAuthenticated) {
      navigationService.getGuacBehavior().then(
        guacData => {
          setIsEligibleForVng(guacData.shouldShowVng);
          setCanAccessStream(guacData.notificationsCanAccessStream);
        },
        () => {
          setRobuxError(translate(layoutConstants.economySystemOutageMessage));
        },
      );
    }
  };
  const getRobuxBadge = () => {
    if (isAuthenticated) {
      navigationService
        .getRobuxBadge()
        .then(({ data: robuxBadgeData }) => {
          const robuxUpdateBadge = shouldShowRobuxUpdateBadge();

          // interpret is_virtual_item_available as indicating we should
          // show the 'New Update' badge, overriding the virtual item badge in all cases.

          // const prevLocalVirtualItemStartTimeSeconds =
          //   getRobuxBadgeLocalStorage(RobuxBadgeType.VIRTUAL_ITEM) || -1;

          if (
            robuxBadgeData.is_virtual_item_available &&
            robuxUpdateBadge
            // prevLocalVirtualItemStartTimeSeconds <
            //   robuxBadgeData.active_virtual_item_start_time_seconds_utc
          ) {
            setRobuxBadgeType(robuxUpdateBadge);
            // setRobuxBadgeType(RobuxBadgeType.VIRTUAL_ITEM);
          }
        })
        .catch(error => {
          if (error.status === 403) {
            setRobuxBadgeType(null);
          } else {
            throw error;
          }
        });
    }
  };

  useEffect(() => {
    window.addEventListener(`navigation-update-user-currency`, () => {
      getUserCurrency();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // Set account notification count
      getAccountNotificationCount().then(setAccountNotificationCount);

      getUserCurrency();

      // Get vng metadata
      getVngMetadata();

      // Get Robux badge data
      getRobuxBadge();

      // Set credit amount
      navigationService
        .getCreditBalanceForNavigation()
        .then(
          ({ data: creditData }) => {
            if (
              creditData.creditDisplayConfig === null ||
              creditData.creditBalance === null ||
              creditData.creditBalance === 0 ||
              creditData.currencyCode === null
            ) {
              // if user isn't enrolled in experiment, show control
              // if creditBalance and currencyCode null (for new users), or creditBalance is 0, don't show credit anywhere
              setCreditDisplayConfig(layoutConstants.creditDisplayConfigVariants.control);
            } else {
              setCreditDisplayConfig(
                creditData.creditDisplayConfig ??
                  layoutConstants.creditDisplayConfigVariants.control,
              );
            }
            setCreditAmount(creditData.creditBalance);
            setCurrencyCode(creditData.currencyCode);
          },
          () => {
            setCreditError(translate(layoutConstants.economySystemOutageMessage));
          },
        )
        .finally(() => {
          setIsExperimentCallDone(true);
        });

      // Conditionally display account switched confirmation banner
      try {
        const accountSwitched = localStorageService.getLocalStorage(
          layoutConstants.accountSwitchConfirmationKeys.accountSwitchedFlag,
        );

        if (accountSwitched) {
          systemFeedbackService.success(
            translate(layoutConstants.accountSwitchConfirmationKeys.accountSwitchedMessage, {
              accountName: authenticatedUser.name,
            }),
            0 /* show delay */,
            5000 /* banner duration */,
          );
          localStorageService.removeLocalStorage(
            layoutConstants.accountSwitchConfirmationKeys.accountSwitchedFlag,
          );
        }
      } catch {
        // no op
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, userId]);

  let notificationStream = (
    <li id="navbar-stream" className="navbar-icon-item navbar-stream">
      <span className="nav-robux-icon rbx-menu-item">
        <span id="notification-stream-icon-container" notification-stream-indicator="true" />
      </span>
    </li>
  );
  try {
    angular.module("notificationStreamIcon");
    angular.module("notificationStream");
    notificationStream = <NotificationStreamPopover />;
  } catch (err) {
    console.error(err);
  }

  return (
    <ul className="nav navbar-right rbx-navbar-icon-group">
      <SystemFeedback />
      <AgeBracketDisplay />
      <UniverseSearchIcon translate={translate} toggleUniverseSearch={toggleUniverseSearch} />
      {canAccessStream && notificationStream}
      <BuyRobuxPopover
        translate={translate}
        robuxAmount={robuxAmount}
        robuxError={robuxError}
        creditAmount={creditAmount}
        currencyCode={currencyCode}
        creditError={creditError}
        creditDisplayConfig={creditDisplayConfig}
        isEligibleForVng={isEligibleForVng}
        isExperimentCallDone={isExperimentCallDone}
        isGetCurrencyCallDone={isGetCurrencyCallDone}
        robuxBadgeType={robuxBadgeType}
      />
      <SettingsPopover translate={translate} accountNotificationCount={accountNotificationCount} />
    </ul>
  );
}

HeaderIconsGroup.propTypes = {
  translate: PropTypes.func.isRequired,
  toggleUniverseSearch: PropTypes.func.isRequired,
};

export default withTranslations(HeaderIconsGroup, translations);
