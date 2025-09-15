import { getBaseDomain } from "./utils/getBaseDomain";

export const setCookie = (cname: string, cvalue: string, exdays: number): void => {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  const expires = `expires=${d.toUTCString()}`;
  const baseDomain = getBaseDomain();
  const domainAttribute = `;domain=.${baseDomain}`;
  document.cookie = `${cname}=${encodeURIComponent(cvalue)};${expires}${domainAttribute}`;
};
