import { useState, useEffect, createElement } from "react";
import { addExternal } from "@rbx/externals";
import { withTranslations, renderWithErrorBoundary } from "@rbx/core-scripts/react";
import { SimpleModal } from "@rbx/core-ui/legacy/react-style-guide";
import {
  VerifiedBadgeTextContainer,
  verifiedBadgeTextContainerReactRenderClass,
  VerifiedBadgeIcon,
  verifiedBadgeIconReactRenderClass,
  PremiumBadgeIcon,
  BadgeSizes,
  // TODO(dlouie, 08/16/22): create a lint rule that enforces outside of this file developers use:
  // import {} from 'roblox-badges'
} from "@rbx/badge-components/dist";
import "@rbx/badge-components/styles/badgeStyles.scss";
import translationConfig from "./src/translation.config";
import { fetchTranslations } from "./src/verifiedBadgeTranslations";

export const currentUserHasVerifiedBadge = () =>
  window.Roblox.CurrentUser.hasVerifiedBadge || false;

export const currentUserHasPremium = () => window.Roblox.CurrentUser.isPremiumUser || false;

export const getCurrentUserId = () => window.Roblox.CurrentUser.userId;

export {
  verifiedBadgeTextContainerReactRenderClass,
  verifiedBadgeIconReactRenderClass,
} from "@rbx/badge-components/dist";

const defaultInitParams = {
  initCallback: () => {},
  overrideIconClass: "",
  overrideContainerClass: "",
};

const dataAttrToReactAttrMap = {
  icontheme: "iconTheme",
  size: "size",
  titletext: "titleText",
  additionalcontainerclass: "additionalContainerClass",
  overridecontainerclass: "overrideContainerClass",
  additionalimgclass: "additionalImgClass",
  overrideimgclass: "overrideImgClass",
  showverifiedbadge: "showVerifiedBadge",
  text: "text",
  textel: "textEl",
  badgeel: "badgeEl",
  overridetextcontainerclass: "overrideTextContainerClass",
  overridewrapperclass: "overridewrapperClass",
  additionaltextcontainerclass: "additionalTextContainerClass",
  additionalwrapperclass: "additionalWrapperClass",
  oniconclick: "onIconClick",
};

const disableModalDataAttr = "disablemodal";

const ready = fn => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
};

export const robloxBadgesReadyForRender = async () => {
  try {
    const depsExist =
      typeof window.RobloxBadges !== "undefined" &&
      typeof window.React !== "undefined" &&
      typeof window.ReactDOM !== "undefined";
    return depsExist;
  } catch (e) {
    return false;
  }
};

const verifiedBadgeInfoModalId = "verified-badge-info-modal";

let updateOutside = () => {};

const openVerifiedBadgeMoreInfoModal = () => {
  updateOutside(true);
};

const closeVerifiedBadgeMoreInfoModal = () => {
  updateOutside(false);
};

const robloxVerifiedBadgeFAQPageUrl = "https://en.help.roblox.com/hc/articles/7997207259156";

const openLearnMoreVerifiedBadgeFAQLink = () => {
  window.open(robloxVerifiedBadgeFAQPageUrl, "_blank");
};

export const VerifiedBadgeInfoModal = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    /* Assign update to outside variable */
    updateOutside = setShowModal;

    /* Unassign when component unmounts */
    return () => {
      updateOutside = null;
    };
  }, []);

  const translations = fetchTranslations();

  const modalBody = (
    <div>
      <div>
        <VerifiedBadgeIcon
          overrideContainerClass="hz-centered-badge-container"
          size={BadgeSizes.TITLE}
          titleText={translations.translatedVerifiedBadgeModalTitleText}
        />
      </div>
      <div>{translations.translatedVerifiedBadgeModalBodyText}</div>
    </div>
  );

  return (
    <SimpleModal
      title={translations.translatedVerifiedBadgeModalTitleText}
      show={showModal}
      body={modalBody}
      actionButtonShow
      actionButtonText={translations.translatedVerifiedBadgeModalLearnMoreLinkText}
      neutralButtonText={translations.translatedVerifiedBadgeModalCloseButtonText}
      onClose={closeVerifiedBadgeMoreInfoModal}
      onNeutral={closeVerifiedBadgeMoreInfoModal}
      onAction={openLearnMoreVerifiedBadgeFAQLink}
    />
  );
};

const VerifiedBadgeIconContainerNoTranslations = props => {
  let { titleText } = props;
  if (titleText === null || titleText === undefined) {
    titleText = props.translate("Creator.VerifiedBadgeIconAccessibilityText");
  }

  return <VerifiedBadgeIcon {...props} titleText={titleText} />;
};
export const VerifiedBadgeIconContainer = withTranslations(
  VerifiedBadgeIconContainerNoTranslations,
  translationConfig,
);

const VerifiedBadgeStringContainerNoTranslations = props => {
  let { titleText } = props;
  if (titleText === null || titleText === undefined) {
    titleText = props.translate("Creator.VerifiedBadgeIconAccessibilityText");
  }

  return <VerifiedBadgeTextContainer {...props} titleText={titleText} />;
};
export const VerifiedBadgeStringContainer = withTranslations(
  VerifiedBadgeStringContainerNoTranslations,
  translationConfig,
);

export const initRobloxBadgesFrameworkAgnostic = async ({
  initCallback,
  overrideIconClass,
  overrideContainerClass,
} = defaultInitParams) => {
  try {
    if (await window.RobloxBadges.robloxBadgesReadyForRender()) {
      const verifiedBadgeTextContainers = document.querySelectorAll(
        `.${
          overrideContainerClass || window.RobloxBadges.verifiedBadgeTextContainerReactRenderClass
        }`,
      );

      const verifiedBadges = document.querySelectorAll(
        `.${overrideIconClass || window.RobloxBadges.verifiedBadgeIconReactRenderClass}`,
      );

      const renderVerifiedBadge = ({ verifiedBadgeIconProps, verifiedBadge }) => {
        const iconToRender = document.createElement("span");

        const reactElToRender = createElement(
          window.RobloxBadges.VerifiedBadgeIcon,
          verifiedBadgeIconProps,
        );

        renderWithErrorBoundary(reactElToRender, iconToRender);

        const parentOfIcon = verifiedBadge.parentNode;
        parentOfIcon.replaceChild(iconToRender, verifiedBadge);

        return parentOfIcon;
      };

      const renderVerifiedBadgeContainer = ({
        verifiedBadgeTextContainerProps,
        verifiedBadgeTextContainerEl,
      }) => {
        const elToRender = document.createElement("span");

        const reactElToRender = createElement(
          window.RobloxBadges.VerifiedBadgeTextContainer,
          verifiedBadgeTextContainerProps,
        );

        renderWithErrorBoundary(reactElToRender, elToRender);

        const parentOfIcon = verifiedBadgeTextContainerEl.parentNode;
        parentOfIcon.replaceChild(elToRender, verifiedBadgeTextContainerEl);

        return parentOfIcon;
      };

      const verifiedBadgeInfoModal = document.querySelectorAll(`#${verifiedBadgeInfoModalId}`);

      if (verifiedBadgeInfoModal.length === 0) {
        const modalToRender = document.createElement("span");

        modalToRender.setAttribute("id", verifiedBadgeInfoModalId);

        document.body.appendChild(modalToRender);

        const verifiedBadgeInfoModalEl = createElement(window.RobloxBadges.VerifiedBadgeInfoModal);

        renderWithErrorBoundary(verifiedBadgeInfoModalEl, modalToRender);
      }

      const translations = fetchTranslations();

      for (let i = 0; i < verifiedBadgeTextContainers.length; i += 1) {
        const verifiedBadgeTextContainerEl = verifiedBadgeTextContainers[i];
        const verifiedBadgeTextContainerProps = {
          titleText: translations.translatedVerifiedBadgeTitleText,
          onIconClick: openVerifiedBadgeMoreInfoModal,
        };

        const keysToTransform = Object.keys(verifiedBadgeTextContainerEl.dataset);

        for (let j = 0; j < keysToTransform.length; j += 1) {
          const lowercasePropName = keysToTransform[j];
          const badgePropName = dataAttrToReactAttrMap[lowercasePropName];
          const propValue = verifiedBadgeTextContainerEl.dataset[lowercasePropName];

          if (badgePropName) {
            verifiedBadgeTextContainerProps[badgePropName] = propValue;
          } else if (lowercasePropName === disableModalDataAttr) {
            verifiedBadgeTextContainerProps.onIconClick = () => {};
          }
        }
        renderVerifiedBadgeContainer({
          verifiedBadgeTextContainerProps,
          verifiedBadgeTextContainerEl,
        });
      }

      for (let i = 0; i < verifiedBadges.length; i += 1) {
        const verifiedBadge = verifiedBadges[i];

        const verifiedBadgeIconProps = {
          titleText: translations.translatedVerifiedBadgeTitleText,
          onIconClick: openVerifiedBadgeMoreInfoModal,
        };

        const keysToTransform = Object.keys(verifiedBadge.dataset);

        for (let j = 0; j < keysToTransform.length; j += 1) {
          const lowercasePropName = keysToTransform[j];
          const badgePropName = dataAttrToReactAttrMap[lowercasePropName];
          const propValue = verifiedBadge.dataset[lowercasePropName];

          if (badgePropName) {
            verifiedBadgeIconProps[badgePropName] = propValue;
          } else if (lowercasePropName === disableModalDataAttr) {
            verifiedBadgeIconProps.onIconClick = () => {};
          }
        }
        renderVerifiedBadge({ verifiedBadgeIconProps, verifiedBadge });
      }
    }
  } catch (e) {
    // noop
  } finally {
    if (typeof initCallback === "function") {
      initCallback();
    }
  }
};

addExternal("RobloxBadges", {
  ready, // not used at the moment
  verifiedBadgeTextContainerReactRenderClass, // not used at the moment
  verifiedBadgeIconReactRenderClass, // not used at the moment
  PremiumBadgeIcon, // not used at the moment
  robloxBadgesReadyForRender,
  BadgeSizes,
  initRobloxBadgesFrameworkAgnostic,
  VerifiedBadgeTextContainer, // not used at the moment
  VerifiedBadgeStringContainer,
  VerifiedBadgeIcon, // not used at the moment
  VerifiedBadgeIconContainer,
  currentUserHasVerifiedBadge,
  currentUserHasPremium, // not used at the moment
  getCurrentUserId, // not used at the moment
  VerifiedBadgeInfoModal, // not used at the moment
  fetchTranslations,
});
