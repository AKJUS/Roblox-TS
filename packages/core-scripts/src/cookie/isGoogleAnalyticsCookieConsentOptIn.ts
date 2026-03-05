import { getCookie } from "./getCookie";

const consentCookieName = "RBXcb";
const googleAnalyticsCookieKey = "GoogleAnalytics";

/**
 * Returns true if the RBXcb cookie has Google Analytics consent set to true.
 * Parses RBXcb (key1=value1&key2=value2) and checks the GoogleAnalytics key.
 */
export const isGoogleAnalyticsCookieConsentOptIn = (): boolean => {
  const consentCookie = getCookie(consentCookieName);
  if (consentCookie == null || consentCookie === "") {
    return false;
  }
  const pairs = consentCookie.split("&");
  const gaPair = pairs.find(pair => pair.split("=")[0] === googleAnalyticsCookieKey);
  const value = gaPair?.split("=")[1];
  return value === "true";
};
