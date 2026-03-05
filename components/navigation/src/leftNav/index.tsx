import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { TranslationProvider } from "@rbx/core-scripts/react";
import LeftNavigationOld from "./old";
import LeftNavigationNew from "./new";
import { translations } from "../../component.json";
import isAccountExperienceRevampEnabled from "../util/accountExperienceUtils";
import { useNewLeftNav } from "./newLeftNav";

const LeftNavigation = () => {
  const newLeftNav = useNewLeftNav();
  const user = authenticatedUser();
  if (!user?.isAuthenticated || isAccountExperienceRevampEnabled()) {
    return null;
  }

  return (
    <TranslationProvider config={translations}>
      {newLeftNav ? <LeftNavigationNew user={user} /> : <LeftNavigationOld />}
    </TranslationProvider>
  );
};

export default LeftNavigation;
