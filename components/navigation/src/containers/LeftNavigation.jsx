import { useState, useEffect, useCallback } from "react";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { withTranslations } from "@rbx/core-scripts/react";
import layoutConstant from "../constants/layoutConstants";
import { translations } from "../../component.json";
import LeftNavigationComponent from "../components/LeftNavigation";

const { headerMenuIconClickEvent } = layoutConstant;

function LeftNavigation(props) {
  const { isAuthenticated } = authenticatedUser;
  const [isLeftNavOpen, setIsLeftNavOpen] = useState(false);

  const onClickMenuIcon = useCallback(() => {
    setIsLeftNavOpen(!isLeftNavOpen);
  }, [isLeftNavOpen]);

  useEffect(() => {
    document.addEventListener(headerMenuIconClickEvent.name, onClickMenuIcon);
    return () => {
      document.removeEventListener(headerMenuIconClickEvent.name, onClickMenuIcon);
    };
  }, [onClickMenuIcon]);

  return isAuthenticated ? <LeftNavigationComponent {...{ isLeftNavOpen, ...props }} /> : null;
}

export default withTranslations(LeftNavigation, translations);
