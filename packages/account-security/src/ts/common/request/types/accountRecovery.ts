/**
 * Account Recovery
 */

import { EnvironmentUrls } from 'Roblox';
import { UrlConfig } from 'core-utilities';

const URL_NOT_FOUND = 'URL_NOT_FOUND';
const apiGatewayUrl = EnvironmentUrls.apiGatewayUrl ?? URL_NOT_FOUND;

const accountRecoveryServiceUrl = `${apiGatewayUrl}/account-recovery-service`;

export enum AccountRecoveryError {
  UNKNOWN = 1,
  REQUEST_TYPE_WAS_INVALID = 2,
  IDENTIFIER_INVALID = 3,
  TOO_MANY_REQUESTS = 4,
  ACCOUNT_NOT_VERIFIED = 5,
  INVALID_CODE = 6,
  INVALID_USER = 7,
  TWO_STEP_VERIFICATION_REQUIRED = 8,
}

export enum RecoveryState {
  Invalid = 'RECOVERY_STATE_INVALID',
  AccountIdentifierRequired = 'RECOVERY_STATE_ACCOUNT_IDENTIFIER_REQUIRED',
  ContactMethodVerificationRequired = 'RECOVERY_STATE_CONTACT_METHOD_VERIFICATION_REQUIRED',
  AwaitingContactMethodVerification = 'RECOVERY_STATE_AWAITING_CONTACT_METHOD_VERIFICATION',
  AccountVerified = 'RECOVERY_STATE_ACCOUNT_VERIFIED'
}

export type IdentifierType = 'phone' | 'email' | 'username';

export type RequestRecoveryMetadata = {
  userID: number;
};

export type RequestRecoveryReturnType = {
  recoveryState: RecoveryState;
  recoverySessionId: string;
  requestRecoveryMetadata: RequestRecoveryMetadata;
};

/**
 * Request Type: `POST`.
 */
export const REQUEST_RECOVERY_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountRecoveryServiceUrl}/v1/request-recovery`,
  timeout: 10000
};

export enum ContactMethodType {
  Email = 2,
  Phone = 3
}

export function contactMethodTypeToString(value: ContactMethodType): string {
  switch (value) {
    case ContactMethodType.Email:
      return 'Email';
    case ContactMethodType.Phone:
      return 'Phone';
    default:
      return 'Unknown';
  }
}

export type SendCodeReturnType = {};

/**
 * Request Type: `POST`
 */
export const SEND_CODE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountRecoveryServiceUrl}/v1/send-code`,
  timeout: 10000
};

export type ResendCodeReturnType = {};

/**
 * Request Type: `POST`
 */
export const RESEND_CODE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountRecoveryServiceUrl}/v1/resend-code`,
  timeout: 10000
};

export type VerifyCodeReturnType = {};

/**
 * Request Type: `POST`
 */
export const VERIFY_CODE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountRecoveryServiceUrl}/v1/verify-code`,
  timeout: 10000
};

export type ContinueRecoveryReturnType = {
  recoveryState: RecoveryState;
}

/**
 * Request Type: `POST`
 */
export const CONTINUE_RECOVERY_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountRecoveryServiceUrl}/v1/continue-recovery`,
  timeout: 10000
};

export type RecoverySessionMetadataReturnType = {
  eligibleUserIDsToRecover: number[];
  shouldAddContactMethod: boolean;
};

/**
 * Request Type: `POST`
 */
export const RECOVERY_SESSION_METADATA_CONFIG: UrlConfig = {
  url: `${accountRecoveryServiceUrl}/v1/recovery-session-metadata`,
  timeout: 10000
};

export type SetEmailReturnType = {};

/**
 * Request Type: `POST`
 */
export const SET_EMAIL_CONFIG: UrlConfig = {
  url: `${accountRecoveryServiceUrl}/v1/set-email`,
  timeout: 10000
};
