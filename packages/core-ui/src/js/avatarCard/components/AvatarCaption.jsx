import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { withTranslations } from "@rbx/core-scripts/react";
import AvatarCaptionTitle from "./AvatarCaptionTitle";
import AvatarCaptionFirstLine from "./AvatarCaptionFirstLine";
import AvatarCaptionSecondLine from "./AvatarCaptionSecondLine";
import AvatarCaptionFooter from "./AvatarCaptionFooter";
import translationConfig from "../translation.config";

function constructUsernameLabel(username, isTrustedConnection, translate) {
  const trustedLabel = ` • ${translate("TrustedConnection.Label.Trusted")}`;
  return username ? `@${username}${isTrustedConnection ? trustedLabel : ""}` : "";
}

const AvatarCaption = ({
  name,
  nameLink,
  displayName,
  labelFirstLine,
  labelFirstLineLink,
  labelSecondLine,
  statusLink,
  statusLinkLabel,
  footer,
  hasMenu,
  truncateFirstLine,
  verifiedBadgeData,
  isTrustedConnection,
  translate,
}) => {
  const cardLabelClassNames = classNames("avatar-card-label", {
    shimmer: !name,
  });
  const useAvatarCaptionFooter = typeof footer === "string";
  return (
    <div
      className={classNames("avatar-card-caption", {
        "has-menu": hasMenu,
      })}
    >
      <span>
        {/* TODO: type and/or migrate `window.Roblox.DisplayNames` */}
        {window.Roblox.DisplayNames.Enabled() ? (
          <React.Fragment>
            <AvatarCaptionTitle
              title={displayName}
              titleLink={nameLink}
              verifiedBadgeData={verifiedBadgeData}
            />
            <div className={cardLabelClassNames}>
              {constructUsernameLabel(name, isTrustedConnection, translate)}
            </div>
          </React.Fragment>
        ) : (
          <AvatarCaptionTitle
            title={name}
            titleLink={nameLink}
            verifiedBadgeData={verifiedBadgeData}
          />
        )}
        <AvatarCaptionFirstLine
          firstLine={labelFirstLine}
          firstLineLink={labelFirstLineLink}
          isSingleLine={truncateFirstLine}
        />
        <AvatarCaptionSecondLine
          secondLine={labelSecondLine}
          status={statusLinkLabel}
          statusLink={statusLink}
        />
      </span>
      {useAvatarCaptionFooter ? <AvatarCaptionFooter footer={footer} /> : footer}
    </div>
  );
};

AvatarCaption.defaultProps = {
  name: "",
  nameLink: "",
  displayName: "",
  labelFirstLine: "",
  labelFirstLineLink: "",
  labelSecondLine: "",
  statusLink: "",
  statusLinkLabel: "",
  footer: undefined,
  hasMenu: false,
  truncateFirstLine: false,
  verifiedBadgeData: {},
  isTrustedConnection: false,
  translate: key => key,
};
AvatarCaption.propTypes = {
  name: PropTypes.string,
  nameLink: PropTypes.string,
  displayName: PropTypes.string,
  labelFirstLine: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  labelFirstLineLink: PropTypes.string,
  labelSecondLine: PropTypes.string,
  statusLink: PropTypes.string,
  statusLinkLabel: PropTypes.string,
  footer: PropTypes.node,
  hasMenu: PropTypes.bool,
  truncateFirstLine: PropTypes.bool,
  verifiedBadgeData: PropTypes.shape({
    hasVerifiedBadge: PropTypes.bool,
    titleText: PropTypes.string,
  }),
  isTrustedConnection: PropTypes.bool,
  translate: PropTypes.func,
};

export default withTranslations(AvatarCaption, translationConfig);
