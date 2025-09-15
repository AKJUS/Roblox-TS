import { getBaseDomain } from "./utils/getBaseDomain";

export const deleteCookie = (cname: string): void => {
  const path = "/";
  const expires = "expires=Thu, 01 Jan 1970 00:00:00 UTC";
  const cookieBase = `${cname}=; ${expires}; path=${path}`;
  const currentHostname = window.location.hostname;
  const baseDomain = getBaseDomain();

  document.cookie = `${cookieBase}; domain=${currentHostname};`;
  if (baseDomain !== currentHostname) {
    document.cookie = `${cookieBase}; domain=${baseDomain};`;
  }
  if (baseDomain.split(".").length >= 2) {
    document.cookie = `${cookieBase}; domain=.${baseDomain};`;
  }
  document.cookie = `${cookieBase};`;
};
