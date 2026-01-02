import React, { useState, useEffect, useCallback } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { withTranslations, queryClient } from "@rbx/core-scripts/react";
import { translations } from "../../component.json";
import { UniversalSearchContainer } from "./UniversalSearch";
import HeaderRightNav from "../components/HeaderRightNav";
import navigationUtil from "../util/navigationUtil";

function NavigationRightHeader(props) {
  const isCurrentMobileSize = navigationUtil.isInMobileSize();
  const [isInMobileSize, setMobileSize] = useState(isCurrentMobileSize);
  const [isUniverseSearchShown, setUniverseSearchShown] = useState(!isCurrentMobileSize);

  const toggleUniverseSearch = () => {
    setUniverseSearchShown(isShown => !isShown);
  };

  const resizeEventHandler = useCallback(() => {
    const isCurrentWindowMobileSize = navigationUtil.isInMobileSize();
    if (isInMobileSize !== isCurrentWindowMobileSize) {
      setMobileSize(isCurrentWindowMobileSize);
      setUniverseSearchShown(!isCurrentWindowMobileSize);
    }
  }, [isInMobileSize]);

  useEffect(() => {
    window.addEventListener("resize", resizeEventHandler);

    return () => {
      window.removeEventListener("resize", resizeEventHandler);
    };
  }, [resizeEventHandler]);

  return (
    <QueryClientProvider client={queryClient}>
      <UniversalSearchContainer isUniverseSearchShown={isUniverseSearchShown} {...props} />
      <HeaderRightNav toggleUniverseSearch={toggleUniverseSearch} {...props} />
    </QueryClientProvider>
  );
}

export default withTranslations(NavigationRightHeader, translations);
