import { httpService } from 'core-utilities';
import { SettingValue } from '../types/settingTypes';
import urlConstants from '../constants/urlConstants';
import { TAuditData } from '../types/legallySensitiveContentTypes';
import { getEncodedAuditHeader } from '../utils/auditUtils';
import UserSetting from '../enums/UserSetting';

/**
 * Updates a user setting with audit support.
 * The audit data is hashed using FNV-1a 32-bit algorithm and included in the request headers.
 *
 * @param {UserSetting} settingName - The name of the setting to update
 * @param {SettingValue} settingValue - The new value for the setting
 * @param {string} surface - The surface this setting update is triggered from, i.e which modal, page, etc.
 * @param {string} auditData - audit data to be included in the audit trail
 * @returns {Promise<any>} A promise that resolves with the response data
 */
export const updateUserSetting = async (
  settingName: UserSetting,
  settingValue: SettingValue,
  surface: string,
  auditData: TAuditData[]
): Promise<any> => {
  const auditHeaderValue = getEncodedAuditHeader(auditData, surface);
  const urlConfig = {
    ...urlConstants.getUserSettingsUrlConfig(),
    headers: {
      'rbx-audit-data': auditHeaderValue
    }
  };
  return httpService.post(urlConfig, { [settingName]: settingValue });
};

export default updateUserSetting;
