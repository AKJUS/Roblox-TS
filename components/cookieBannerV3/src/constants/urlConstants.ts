import { getAbsoluteUrl } from '@rbx/core-scripts/endpoints';

const privacyPolicyUrl = getAbsoluteUrl('/info/privacy');
const supportUrl = getAbsoluteUrl('/support');
const googleAnalyticsWebsite = 'https://marketingplatform.google.com/about/analytics/';
const googleAnalyticsReadMore =
  'https://developers.google.com/analytics/devguides/collection/analyticsjs/cookie-usage';

export default {
  privacyPolicyUrl,
  googleAnalyticsWebsite,
  supportUrl,
  googleAnalyticsReadMore
};
