import { useEffect } from "react";
import PropTypes from "prop-types";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@rbx/core-ui/legacy/react-style-guide";
import { AccountSwitcherService } from "@rbx/core-scripts/legacy/Roblox";
import { dataStores } from "@rbx/core-scripts/legacy/core-roblox-utilities";
import { getSignupUrl, getIsVNGLandingRedirectEnabled } from "../util/authUtil";
import isAccountExperienceRevampEnabled from "../util/accountExperienceUtils";

function HeaderSignupLink({ translate }) {
  // use effect for get signupurl
  const [isAccountSwitchingEnabledForBrowser] =
    AccountSwitcherService?.useIsAccountSwitcherAvailableForBrowser() ?? [false];

  const handleSignupClick = () => {
    window.location.href = getSignupUrl(isAccountSwitchingEnabledForBrowser);
  };

  useEffect(() => {
    try {
      const {
        authIntentDataStore: { saveGameIntentFromCurrentUrl },
      } = dataStores;
      saveGameIntentFromCurrentUrl();
    } catch (e) {
      console.error("Failed to save game intent from current url", e);
    }
  }, []);

  const { data: hideSignupButton } = useQuery({
    queryKey: ["getIsVNGLandingRedirectEnabled"],
    queryFn: getIsVNGLandingRedirectEnabled,
    placeholderData: true,
  });

  return (
    !hideSignupButton && (
      <li className="signup-button-container">
        <Link
          onClick={handleSignupClick}
          url={getSignupUrl(isAccountSwitchingEnabledForBrowser)}
          id="sign-up-button"
          className="rbx-navbar-signup btn-growth-sm nav-menu-title signup-button"
        >
          {translate(isAccountExperienceRevampEnabled() ? "Label.CreateAccount" : "Label.sSignUp")}
        </Link>
      </li>
    )
  );
}
HeaderSignupLink.propTypes = {
  translate: PropTypes.func.isRequired,
};

export default HeaderSignupLink;
