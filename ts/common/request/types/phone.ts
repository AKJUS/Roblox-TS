/**
 * Phone
 */

import { EnvironmentUrls } from 'Roblox';
import { UrlConfig } from 'core-utilities';

const URL_NOT_FOUND = 'URL_NOT_FOUND';
const accountInformationApiUrl = EnvironmentUrls.accountInformationApi ?? URL_NOT_FOUND;
const apiGateWayUrl = EnvironmentUrls.apiGatewayUrl ?? URL_NOT_FOUND;

export enum PhoneError {
  UNKNOWN = 0
}

export type GetPhoneConfigurationReturnType = {
  phone: string;
  isVerified: boolean;
};

/**
 * Request Type: `GET`.
 */
export const GET_PHONE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountInformationApiUrl}/v1/phone`,
  timeout: 10000
};

export type PhonePrefix = {
  name: string;
  code: string;
  prefix: string;
  localizedName: string;
  isDefault: boolean;
};

export type GetPhonePrefixesListReturnType = PhonePrefix[];

/**
 * Request Type: `GET`.
 */
export const GET_PHONE_PREFIXES_LIST_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${apiGateWayUrl}/phone-number-api/v1/phone-prefix-list`,
  timeout: 10000
};
