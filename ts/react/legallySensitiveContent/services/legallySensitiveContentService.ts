import { TranslateFunction } from 'react-utilities';
import { UserSetting } from '../enums/UserSetting';
import {
  TLegallySensitiveData,
  TLegallySensitiveActions
} from '../types/legallySensitiveContentTypes';
import { SettingValue } from '../types/settingTypes';
import legallySensitiveContentConstants from '../constants/legallySensitiveContentConstants';
import { updateUserSetting } from './userSettingsService';
import { getAuditDataForConsent, getEncodedAuditHeader } from '../utils/auditUtils';
import ConsentName from '../enums/ConsentName';

/**
 * Hook for managing legally sensitive content and actions.
 * This hook provides a standardized way to handle legally sensitive content,
 * such as consent forms and user settings updates with audit logs.
 *
 * @param {TranslateFunction} translate - Function to translate text
 * @param {ConsentName} consentName - The name of the consent being updated
 * @param {string} surface - The surface this setting update is triggered from, i.e which modal, page, etc.
 * @returns {[TLegallySensitiveData, TLegallySensitiveActions]} Tuple containing:
 *   - Legally sensitive data (consent text and form type)
 *   - Actions for updating settings with audit logs
 */
export const useTranslatedLegallySensitiveContentAndActions = (
  translate: TranslateFunction,
  consentName: ConsentName,
  surface: string
): [TLegallySensitiveData, TLegallySensitiveActions] => {
  const getLegallySensitiveData = (): TLegallySensitiveData => {
    let languageConstants;
    switch (consentName) {
      case ConsentName.phoneNumberDiscoverabilitySetting:
        languageConstants = legallySensitiveContentConstants.phoneNumberDiscoverabilitySetting;
        return {
          wordsOfConsent: {
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.phoneNumberDiscoverabilitySettingParentSide:
        languageConstants =
          legallySensitiveContentConstants.phoneNumberDiscoverabilitySettingParentSide;
        return {
          wordsOfConsent: {
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.phoneNumberDiscoverabilityUpsell:
        languageConstants = legallySensitiveContentConstants.phoneNumberDiscoverabilityUpsell;
        return {
          wordsOfConsent: {
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey),
            actionButtonText: translate(languageConstants.actionButtonTextTranslationKey),
            neutralButtonText: translate(languageConstants.neutralButtonTextTranslationKey)
          }
        };
      case ConsentName.personalizedAdsSetting:
        languageConstants = legallySensitiveContentConstants.personalizedAdsSetting;
        return {
          wordsOfConsent: {
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey, {
              linkStart: languageConstants.linkStart,
              linkEnd: languageConstants.linkEnd
            })
          }
        };
      case ConsentName.sellShareDataSetting:
        languageConstants = legallySensitiveContentConstants.sellShareDataSetting;
        return {
          wordsOfConsent: {
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey, {
              linkStart: languageConstants.linkStart,
              linkEnd: languageConstants.linkEnd
            })
          }
        };
      case ConsentName.allowMarketingEmailCheckboxEmailVerification:
        languageConstants =
          legallySensitiveContentConstants.allowMarketingEmailCheckboxEmailVerification;
        return {
          wordsOfConsent: {
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.voiceDataConsentSetting:
        languageConstants = legallySensitiveContentConstants.voiceDataConsentSetting;
        return {
          wordsOfConsent: {
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey, {
              linkStart: languageConstants.linkStart,
              linkEnd: languageConstants.linkEnd
            })
          }
        };
      case ConsentName.voiceDataConsentSettingParentSide:
        languageConstants = legallySensitiveContentConstants.voiceDataConsentSettingParentSide;
        return {
          wordsOfConsent: {
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey, {
              linkStart: languageConstants.linkStart,
              linkEnd: languageConstants.linkEnd
            })
          }
        };
      default:
        return undefined;
    }
  };

  const updateSettingWithAuditing = async (
    settingName: UserSetting,
    settingValue: SettingValue,
    additionalContextualData: string
  ) => {
    const auditData = getAuditDataForConsent(consentName, translate);
    try {
      await updateUserSetting(settingName, settingValue, surface, auditData);
    } catch (error) {
      // TODO: Add error handling
    }
  };

  const getBase64EncodedAuditHeader = (): string => {
    const auditData = getAuditDataForConsent(consentName, translate);
    const encodedHeaderValue = getEncodedAuditHeader(auditData, surface);
    return encodedHeaderValue;
  };

  const legallySensitiveData = getLegallySensitiveData();
  const legallySensitiveActions: TLegallySensitiveActions = {
    updateSettingWithAuditing,
    getBase64EncodedAuditHeader
  };

  return [legallySensitiveData, legallySensitiveActions];
};

export default useTranslatedLegallySensitiveContentAndActions;
