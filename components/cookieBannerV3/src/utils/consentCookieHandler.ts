import { getCookie, deleteCookie, setCookie } from '@rbx/core-scripts/cookie';
import cookieConstants from '../constants/cookieConstants';

const setUserConsent = (acceptCookieNames: string[], nonEssentialCookieList: string[]): void => {
  const currentConsentCookie = getCookie(cookieConstants.consentCookieName);
  if (currentConsentCookie && currentConsentCookie.length > 0) {
    deleteCookie(cookieConstants.consentCookieName);
  }
  let consentCookieConfig = '';
  const cookiesToBeDeleted: string[] = [];
  nonEssentialCookieList.forEach((cookie, index) => {
    if (acceptCookieNames.includes(cookie)) {
      consentCookieConfig += `${cookie}=true&`;
    } else {
      consentCookieConfig += `${cookie}=false&`;
      cookiesToBeDeleted.push(cookie);
    }
    if (index === nonEssentialCookieList.length - 1) {
      consentCookieConfig = consentCookieConfig.slice(0, -1);
    }
  });

  cookiesToBeDeleted.forEach(cookie => {
    deleteCookie(cookie);
  });

  setCookie(
    cookieConstants.consentCookieName,
    consentCookieConfig,
    cookieConstants.consentExpirationDays
  );
};

const isAnalyticsCookieAccepted = (): boolean => {
  const consentCookie = getCookie(cookieConstants.consentCookieName);
  if (!consentCookie || consentCookie === '') {
    return false;
  }
  const analyticsCookies = consentCookie.split('&');
  const acceptedAnalyticsCookie = analyticsCookies.find(cookie => {
    const value = cookie.split('=')[1];
    return value === 'true';
  });
  return !!acceptedAnalyticsCookie;
};

export default { setUserConsent, isAnalyticsCookieAccepted };
