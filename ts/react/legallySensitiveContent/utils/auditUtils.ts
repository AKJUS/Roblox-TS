import { cryptoUtil } from 'core-roblox-utilities';
import { TranslateFunction } from 'react-utilities';
import { TAuditData, TAuditHeaderPayload } from '../types/legallySensitiveContentTypes';
import legallySensitiveContentConstants from '../constants/legallySensitiveContentConstants';
import ConsentName from '../enums/ConsentName';

/**
 * Creates audit data for consent forms.
 * This function generates audit data based on the consent name and translation function.
 *
 * @param {TConsentName} consentName - The consent name to generate audit data for
 * @param {TranslateFunction} translate - Function to translate text
 * @returns {TAuditData[]} Array of audit data objects
 */
export const getAuditDataForConsent = (
  consentName: ConsentName,
  translate: TranslateFunction
): TAuditData[] => {
  switch (consentName) {
    case ConsentName.phoneNumberDiscoverabilitySetting:
      return [
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.phoneNumberDiscoverabilitySetting.titleTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.phoneNumberDiscoverabilitySetting.titleSourceContentId
        },
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.phoneNumberDiscoverabilitySetting.consentTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.phoneNumberDiscoverabilitySetting
              .consentSourceContentId
        }
      ];
    case ConsentName.phoneNumberDiscoverabilitySettingParentSide:
      return [
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.phoneNumberDiscoverabilitySettingParentSide
              .titleTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.phoneNumberDiscoverabilitySettingParentSide
              .titleSourceContentId
        },
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.phoneNumberDiscoverabilitySettingParentSide
              .consentTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.phoneNumberDiscoverabilitySettingParentSide
              .consentSourceContentId
        }
      ];
    case ConsentName.phoneNumberDiscoverabilityUpsell:
      return [
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.phoneNumberDiscoverabilityUpsell.titleTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.phoneNumberDiscoverabilityUpsell.titleSourceContentId
        },
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.phoneNumberDiscoverabilityUpsell.consentTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.phoneNumberDiscoverabilityUpsell.consentSourceContentId
        },
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.phoneNumberDiscoverabilityUpsell
              .actionButtonTextTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.phoneNumberDiscoverabilityUpsell
              .actionButtonTextSourceContentId
        },
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.phoneNumberDiscoverabilityUpsell
              .neutralButtonTextTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.phoneNumberDiscoverabilityUpsell
              .neutralButtonTextSourceContentId
        }
      ];
    case ConsentName.personalizedAdsSetting:
      return [
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.personalizedAdsSetting.titleTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.personalizedAdsSetting.titleSourceContentId
        },
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.personalizedAdsSetting.consentTranslationKey,
            {
              linkStart: legallySensitiveContentConstants.personalizedAdsSetting.linkStartParam,
              linkEnd: legallySensitiveContentConstants.personalizedAdsSetting.linkEndParam
            }
          ),
          sourceContentId:
            legallySensitiveContentConstants.personalizedAdsSetting.consentSourceContentId,
          vars: {
            linkStart: legallySensitiveContentConstants.personalizedAdsSetting.linkStart,
            linkEnd: legallySensitiveContentConstants.personalizedAdsSetting.linkEnd
          }
        }
      ];
    case ConsentName.sellShareDataSetting:
      return [
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.sellShareDataSetting.titleTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.sellShareDataSetting.titleSourceContentId
        },
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.sellShareDataSetting.consentTranslationKey,
            {
              linkStart: legallySensitiveContentConstants.sellShareDataSetting.linkStartParam,
              linkEnd: legallySensitiveContentConstants.sellShareDataSetting.linkEndParam
            }
          ),
          sourceContentId:
            legallySensitiveContentConstants.sellShareDataSetting.consentSourceContentId,
          vars: {
            linkStart: legallySensitiveContentConstants.sellShareDataSetting.linkStart,
            linkEnd: legallySensitiveContentConstants.sellShareDataSetting.linkEnd
          }
        }
      ];
    case ConsentName.allowMarketingEmailCheckboxEmailVerification:
      return [
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.allowMarketingEmailCheckboxEmailVerification
              .consentTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.allowMarketingEmailCheckboxEmailVerification
              .consentSourceContentId
        }
      ];
    case ConsentName.voiceDataConsentSetting:
      return [
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.voiceDataConsentSetting.titleTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.voiceDataConsentSetting.titleSourceContentId
        },
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.voiceDataConsentSetting.consentTranslationKey,
            {
              linkStart: legallySensitiveContentConstants.voiceDataConsentSetting.linkStartParam,
              linkEnd: legallySensitiveContentConstants.voiceDataConsentSetting.linkEndParam
            }
          ),
          sourceContentId:
            legallySensitiveContentConstants.voiceDataConsentSetting.consentSourceContentId,
          vars: {
            linkStart: legallySensitiveContentConstants.voiceDataConsentSetting.linkStart,
            linkEnd: legallySensitiveContentConstants.voiceDataConsentSetting.linkEnd
          }
        }
      ];
    case ConsentName.voiceDataConsentSettingParentSide:
      return [
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.voiceDataConsentSettingParentSide.titleTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.voiceDataConsentSettingParentSide.titleSourceContentId
        },
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.voiceDataConsentSettingParentSide
              .consentTranslationKey,
            {
              linkStart:
                legallySensitiveContentConstants.voiceDataConsentSettingParentSide.linkStartParam,
              linkEnd:
                legallySensitiveContentConstants.voiceDataConsentSettingParentSide.linkEndParam
            }
          ),
          sourceContentId:
            legallySensitiveContentConstants.voiceDataConsentSettingParentSide
              .consentSourceContentId,
          vars: {
            linkStart: legallySensitiveContentConstants.voiceDataConsentSettingParentSide.linkStart,
            linkEnd: legallySensitiveContentConstants.voiceDataConsentSettingParentSide.linkEnd
          }
        }
      ];
    default:
      return [];
  }
};

/**
 * Creates an audit header payload from an array of audit data.
 * Each item in the array is hashed and combined with its vars into a single object.
 *
 * @param {TAuditData[]} auditData - Array of audit data to be included in the header
 * @param {string} surface - The surface of the audit data
 * @returns {TAuditHeaderPayload} audit header payload
 */
export const getAuditHeaderPayload = (
  auditData: TAuditData[],
  surface: string,
  additionalContextualData?: Record<string, any>
): TAuditHeaderPayload => {
  const auditHeaderPayload = {
    content: auditData.reduce(
      (acc, data) => ({
        ...acc,
        [data.sourceContentId]: {
          hash: cryptoUtil.hashStringWithFnv1a32(data.consentStringTemplate),
          ...data.vars
        }
      }),
      {}
    ),
    surface,
    ...additionalContextualData
  };

  return auditHeaderPayload;
};

/**
 * Encodes the audit header payload to a base64 url-safe encoded string.
 *
 * @param {TAuditData[]} auditData - Array of audit data to be included in the header
 * @param {string} surface - The surface of the audit data
 * @returns {string} base64 url-safe encoded audit header value
 */
export const getEncodedAuditHeader = (
  auditData: TAuditData[],
  surface: string,
  additionalContextualData?: Record<string, any>
): string => {
  const auditHeaderPayload = getAuditHeaderPayload(auditData, surface, additionalContextualData);
  const json = JSON.stringify(auditHeaderPayload);
  const encodedHeaderValue = cryptoUtil.stringToUrlSafeBase64(json);

  return encodedHeaderValue;
};
