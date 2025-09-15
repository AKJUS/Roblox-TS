import environmentUrls from '@rbx/environment-urls';
import { getAbsoluteUrl } from '@rbx/core-scripts/endpoints';

export default {
  getEmailStatusUrl: () => `${environmentUrls.accountSettingsApi}/v1/email`,
  getSignupRedirUrl: () => getAbsoluteUrl('/account/signupredir'),
  getHomeUrl: () => getAbsoluteUrl('/home'),
  getWebsiteUrl: () => environmentUrls.websiteUrl,
  getLogoutUrl: () => `${environmentUrls.authApi}/v2/logout`,
  getRefreshSessionUrl: () => `${environmentUrls.authApi}/v2/session/refresh`,
  getRootUrl: () => getAbsoluteUrl('/'),
  getSponsoredPageUrl: () => `${environmentUrls.adsApi}/v1/sponsored-pages`,
  getSponsoredEventUrl: (pageType, name) => getAbsoluteUrl(`/${pageType.toLowerCase()}/${name}`),
  getUnreadPrivateMessagesCountUrl: () =>
    `${environmentUrls.privateMessagesApi}/v1/messages/unread/count`,
  getUserCurrencyUrl: userId => `${environmentUrls.economyApi}/v1/users/${userId}/currency`,
  getTradeStatusCountUrl: () => `${environmentUrls.tradesApi}/v1/trades/inbound/count`,
  getFriendsRequestCountUrl: () => `${environmentUrls.friendsApi}/v1/user/friend-requests/count`,
  getAuthTokenMetaUrl: () =>
    `${environmentUrls.apiGatewayUrl}/auth-token-service/v1/login/metadata`,
  getLoginUrl: () => getAbsoluteUrl('/login'),
  getNewLoginUrl: () => getAbsoluteUrl('/newLogin'),
  getAccountSwitchingSignUpUrl: () => getAbsoluteUrl('/CreateAccount'),
  getCreditBalanceForNavigationUrl: () =>
    `${environmentUrls.apiGatewayUrl}/credit-balance/v1/get-credit-balance-for-navigation`,
  getGiftCardVisibilityUrl: () =>
    `${environmentUrls.apiGatewayUrl}/credit-balance/v1/get-gift-card-visibility`,
  getSignedVngShopUrl: () => `${environmentUrls.apiGatewayUrl}/vng-payments/v1/getVngShopUrl`,
  getRobuxBadgeUrl: () => `${environmentUrls.apiGatewayUrl}/robuxbadge/v1/robuxbadge`
};
