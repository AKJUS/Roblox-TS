import { Fragment } from "react";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { IconButton } from "@rbx/core-ui/legacy/react-style-guide";
import { withTranslations } from "@rbx/core-scripts/react";
import { translations } from "../../component.json";
import layoutConstant from "../constants/layoutConstants";
import SkipToMainContent from "../components/SkipToMainContent";
import isAccountExperienceRevampEnabled from "../util/accountExperienceUtils";

const { headerMenuIconClickEvent } = layoutConstant;
const { isAuthenticated } = authenticatedUser;

function MenuIcon(props) {
  const { iconTypes } = IconButton;
  const onClickMenuIcon = () => {
    document.dispatchEvent(new CustomEvent(headerMenuIconClickEvent.name));
  };

  // Hide menu icon when account experience revamp is enabled
  if (isAccountExperienceRevampEnabled()) {
    return null;
  }

  return (
    <Fragment>
      <SkipToMainContent {...props} />
      {isAuthenticated && (
        <IconButton
          className="menu-button"
          iconType={iconTypes.navigation}
          iconName="nav-menu"
          onClick={onClickMenuIcon}
        />
      )}
    </Fragment>
  );
}

MenuIcon.propTypes = {};

export default withTranslations(MenuIcon, translations);
