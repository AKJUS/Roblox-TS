import { useEffect, useState } from 'react';
import { Guac } from 'Roblox';
import { TranslateFunction } from 'react-utilities';
import { UserSetting } from '../enums/UserSetting';
import {
  TLegallySensitiveData,
  TLegallySensitiveActions
} from '../types/legallySensitiveContentTypes';
import { SettingValue } from '../types/settingTypes';
import legallySensitiveContentConstants, {
  PHONE_DISCOVERABILITY_CONSENT_FRIENDS_RENAME_KEY,
  PHONE_DISCOVERABILITY_PARENT_SIDE_CONSENT_FRIENDS_RENAME_KEY
} from '../constants/legallySensitiveContentConstants';
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
  const [
    connectionsToFriendsRenameEnabled,
    setConnectionsToFriendsRenameEnabled
  ] = useState<boolean>(false);

  useEffect(() => {
    Guac.callBehaviour<{ connectionsToFriendsRenameEnabled: boolean }>('web-rename-friends')
      .then(data => {
        setConnectionsToFriendsRenameEnabled(data.connectionsToFriendsRenameEnabled ?? false);
      })
      .catch(() => {
        setConnectionsToFriendsRenameEnabled(false);
      });
  }, []);

  const getAuditConsentName = (): ConsentName => {
    if (
      consentName === ConsentName.phoneNumberDiscoverabilitySetting &&
      connectionsToFriendsRenameEnabled
    ) {
      return ConsentName.phoneNumberDiscoverabilitySettingFriendsRename;
    }
    return consentName;
  };

  const getLegallySensitiveData = (): TLegallySensitiveData => {
    let languageConstants;
    switch (consentName) {
      case ConsentName.phoneNumberDiscoverabilitySetting: {
        languageConstants = legallySensitiveContentConstants.phoneNumberDiscoverabilitySetting;
        const consentKey = connectionsToFriendsRenameEnabled
          ? PHONE_DISCOVERABILITY_CONSENT_FRIENDS_RENAME_KEY
          : languageConstants.consentTranslationKey;
        return {
          wordsOfConsent: {
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(consentKey)
          }
        };
      }
      case ConsentName.phoneNumberDiscoverabilitySettingParentSide: {
        const phoneParentConstants =
          legallySensitiveContentConstants.phoneNumberDiscoverabilitySettingParentSide;
        const consentKey = connectionsToFriendsRenameEnabled
          ? PHONE_DISCOVERABILITY_PARENT_SIDE_CONSENT_FRIENDS_RENAME_KEY
          : phoneParentConstants.consentTranslationKey;
        return {
          wordsOfConsent: {
            title: translate(phoneParentConstants.titleTranslationKey),
            consent: translate(consentKey)
          }
        };
      }
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
    additionalContextualData?: Record<string, unknown>
  ) => {
    const auditData = getAuditDataForConsent(getAuditConsentName(), translate);
    const auditHeaderValue = getEncodedAuditHeader(auditData, surface, additionalContextualData);
    try {
      await updateUserSetting(settingName, settingValue, auditHeaderValue);
    } catch (error) {
      // TODO: Add error handling
    }
  };

  const getBase64EncodedAuditHeader = (
    additionalContextualData?: Record<string, unknown>
  ): string => {
    const auditData = getAuditDataForConsent(getAuditConsentName(), translate);
    const encodedHeaderValue = getEncodedAuditHeader(auditData, surface, additionalContextualData);
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
