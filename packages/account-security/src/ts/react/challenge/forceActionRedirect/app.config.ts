import { ForceActionRedirect } from '@rbx/generic-challenge-types';
import { TranslationConfig } from 'react-utilities';

export const FEATURE_NAME = 'ForceActionRedirect' as const;
export const LOG_PREFIX = 'ForceActionRedirect:' as const;

// This is the 2-Step Verification path in Account Settings.
export const ACCOUNT_SETTINGS_SECURITY_PATH = '/my/account#!/security?src=';

/**
 * Translations required by this web app (remember to also edit
 * `bundle.config.js` if changing this configuration).
 */
const FORCE_AUTHENTICATOR_TRANSLATION_CONFIG: TranslationConfig = {
  common: [],
  feature: 'Feature.ForceAuthenticator'
};

const FORCE_TWO_STEP_VERIFICATION_TRANSLATION_CONFIG: TranslationConfig = {
  common: [],
  feature: 'Feature.ForceTwoStepVerification'
};

const BLOCK_SESSION_TRANSLATION_CONFIG: TranslationConfig = {
  common: [],
  feature: 'Feature.Denied'
};

/**
 * Language resource keys for force authenticator that are requested dynamically.
 */
export const FORCE_AUTHENTICATOR_LANGUAGE_RESOURCES = [
  'Action.Setup',
  'Description.Reason',
  'Description.SetupAuthenticator',
  'Header.TurnOnAuthenticator'
] as const;

export const FORCE_TWO_STEP_VERIFICATION_LANGUAGE_RESOURCES = [
  'ForceTwoStepVerification.Header',
  'ForceTwoStepVerification.Body',
  'ForceTwoStepVerification.Action'
] as const;

// Intentionally not a const anymore as we will be loading these resource keys dynamically from
// the service. This means this is no longer exhaustive / typesafe...
export const BLOCK_SESSION_LANGUAGE_RESOURCES = ['Denied.Header', 'Denied.Body', 'Denied.Action'];

// translationsParametersByKey populates translation key templates by their key. Dynamic key
// users should populate these *before* returning new dynamic keys from GCC (or any other
// server-vended code).
export const translationsParametersByKey = (translationKey: string): Record<string, string> => {
  switch (translationKey) {
    case 'Denied.AutomatedTampering.Body': {
      return {
        linkStart: `<a href="https://en.help.roblox.com/hc/en-us/articles/204038784-General-Website-Issues" 
          class="text-link"
          target="_blank">`,
        linkEnd: '</a>'
      };
    }
    case 'Denied.DeviceBlock.Body': {
      return {
        communityStandardsLinkStart: `<a href="https://en.help.roblox.com/hc/en-us/articles/203313410-Roblox-Community-Standards"
          class="text-link"
          target="_blank">`,
        communityStandardsLinkEnd: '</a>',
        appealLinkStart: `<a href="https://en.help.roblox.com/hc/en-us/articles/360000245263-Appeal-Your-Content-or-Account-Moderation?src=contact_us"
        class="text-link"
        target="_blank">`,
        appealLinkEnd: '</a>'
      };
    }
    case 'Denied.DeviceBlockCredentialVariant.Body': {
      return {
        communityStandardsLinkStart: `<a href="https://en.help.roblox.com/hc/en-us/articles/203313410-Roblox-Community-Standards"
          class="text-link"
          target="_blank">`,
        communityStandardsLinkEnd: '</a>',
        appealLinkStart: `<a href="https://en.help.roblox.com/hc/en-us/articles/360000245263-Appeal-Your-Content-or-Account-Moderation?src=contact_us"
        class="text-link"
        target="_blank">`,
        appealLinkEnd: '</a>'
      };
    }
    default: {
      return {};
    }
  }
};

export const getForceActionRedirectChallengeConfig = ({
  forceActionRedirectChallengeType,
  actionTranslationKey,
  bodyTranslationKey,
  headerTranslationKey
}: Pick<
  ForceActionRedirect.ChallengeParameters,
  | 'forceActionRedirectChallengeType'
  | 'actionTranslationKey'
  | 'bodyTranslationKey'
  | 'headerTranslationKey'
>): ForceActionRedirect.ForceActionRedirectChallengeConfig => {
  switch (forceActionRedirectChallengeType) {
    case ForceActionRedirect.ForceActionRedirectChallengeType.ForceAuthenticator:
      return {
        redirectURLSignifier: 'forceauthenticator' as const,
        translationConfig: FORCE_AUTHENTICATOR_TRANSLATION_CONFIG,
        translationResourceKeys: ForceActionRedirect.FORCE_AUTHENTICATOR_LANGUAGE_RESOURCES,
        getTranslationResources: (
          translate: ForceActionRedirect.ForceActionRedirectTranslateFunction
        ) =>
          ({
            Header: translate('Header.TurnOnAuthenticator'),
            // TODO: Consolidate both of these description resources under a single resource.
            Body: `${translate('Description.SetupAuthenticator')}\n${translate(
              'Description.Reason'
            )}`,
            Action: translate('Action.Setup')
          } as const)
      };
    case ForceActionRedirect.ForceActionRedirectChallengeType.ForceTwoStepVerification:
      return {
        redirectURLSignifier: 'forcetwostepverification' as const,
        translationConfig: FORCE_TWO_STEP_VERIFICATION_TRANSLATION_CONFIG,
        translationResourceKeys: ForceActionRedirect.FORCE_TWO_STEP_VERIFICATION_LANGUAGE_RESOURCES,
        getTranslationResources: (
          translate: ForceActionRedirect.ForceActionRedirectTranslateFunction
        ) =>
          ({
            Header: translate('ForceTwoStepVerification.Header'),
            Body: translate('ForceTwoStepVerification.Body'),
            Action: translate('ForceTwoStepVerification.Action')
          } as const)
      };
    case ForceActionRedirect.ForceActionRedirectChallengeType.BlockSession:
      return {
        redirectURLSignifier: 'blocksession' as const,
        translationConfig: BLOCK_SESSION_TRANSLATION_CONFIG,
        translationResourceKeys: ForceActionRedirect.BLOCK_SESSION_LANGUAGE_RESOURCES,
        getTranslationResources: (
          translate: ForceActionRedirect.ForceActionRedirectTranslateFunction
        ) => {
          const maybeDynamicHeaderKey = headerTranslationKey || 'Denied.Header';
          const maybeDynamicBodyKey = bodyTranslationKey || 'Denied.Body';
          const maybeDynamicActionKey = actionTranslationKey || 'Denied.Action';
          return {
            Header: translate(
              maybeDynamicHeaderKey,
              translationsParametersByKey(maybeDynamicHeaderKey)
            ),
            Body: translate(maybeDynamicBodyKey, translationsParametersByKey(maybeDynamicBodyKey)),
            Action: translate(
              maybeDynamicActionKey,
              translationsParametersByKey(maybeDynamicActionKey)
            )
          } as const;
        }
      };
    default:
      throw new Error('Invalid ForceActionRedirectChallengeType');
  }
};
