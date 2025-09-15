import { NavigationService } from 'Roblox';
import { urlService } from 'core-utilities';
import { TSduiActionConfig, TSduiParsedActionConfig } from '../SduiActionParserRegistry';
import logSduiError, { SduiErrorNames } from '../../utils/logSduiError';
import { TAnalyticsContext, TSduiContext } from '../SduiTypes';

const openSignupParser = (
  _actionConfig: TSduiActionConfig,
  _analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext
): TSduiParsedActionConfig => {
  const { getSignupUrl } = NavigationService || {};
  if (!getSignupUrl) {
    const defaultSignupUrl = urlService.getAbsoluteUrl('/account/signupredir');
    logSduiError(
      SduiErrorNames.SduiActionOpenSignupInvalidGetSignupUrl,
      'getSignupUrl is not defined',
      sduiContext.pageContext
    );
    return {
      linkPath: defaultSignupUrl
    };
  }

  return {
    linkPath: getSignupUrl()
  };
};

export default openSignupParser;
