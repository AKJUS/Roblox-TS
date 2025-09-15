import { httpService } from 'core-utilities';
import { Result } from '../../result';
import { toResult } from '../common';
import * as AccountRecovery from '../types/accountRecovery';

export const requestRecovery = (
  identifier: string,
  identifierType: AccountRecovery.IdentifierType,
  recoverySessionId?: string
): Promise<
  Result<AccountRecovery.RequestRecoveryReturnType, AccountRecovery.AccountRecoveryError | null>
> =>
  toResult(
    httpService.post(AccountRecovery.REQUEST_RECOVERY_CONFIG, {
      identifier,
      identifierType,
      recoverySessionId
    }),
    AccountRecovery.AccountRecoveryError
  );

export const sendCode = (
  contactMethod: string,
  contactMethodType: AccountRecovery.ContactMethodType,
  recoverySessionId: string
): Promise<
  Result<AccountRecovery.SendCodeReturnType, AccountRecovery.AccountRecoveryError | null>
> =>
  toResult(
    httpService.post(AccountRecovery.SEND_CODE_CONFIG, {
      contactMethod,
      contactMethodType,
      recoverySessionId
    }),
    AccountRecovery.AccountRecoveryError
  );

export const resendCode = (
  recoverySessionId: string
): Promise<
  Result<AccountRecovery.ResendCodeReturnType, AccountRecovery.AccountRecoveryError | null>
> =>
  toResult(
    httpService.post(AccountRecovery.RESEND_CODE_CONFIG, {
      recoverySessionId
    }),
    AccountRecovery.AccountRecoveryError
  );

export const verifyCode = (
  recoverySessionId: string,
  code: string
): Promise<
  Result<AccountRecovery.VerifyCodeReturnType, AccountRecovery.AccountRecoveryError | null>
> =>
  toResult(
    httpService.post(AccountRecovery.VERIFY_CODE_CONFIG, {
      recoverySessionId,
      code
    }),
    AccountRecovery.AccountRecoveryError
  );

export const recoverySessionMetadata = (
  recoverySessionId: string
): Promise<
  Result<
    AccountRecovery.RecoverySessionMetadataReturnType,
    AccountRecovery.AccountRecoveryError | null
  >
> =>
  toResult(
    httpService.post(AccountRecovery.RECOVERY_SESSION_METADATA_CONFIG, {
      recoverySessionId
    }),
    AccountRecovery.AccountRecoveryError
  );

export const setEmail = (
  recoverySessionId: string
): Promise<
  Result<AccountRecovery.SetEmailReturnType, AccountRecovery.AccountRecoveryError | null>
> =>
  toResult(
    httpService.post(AccountRecovery.SET_EMAIL_CONFIG, {
      recoverySessionId
    }),
    AccountRecovery.AccountRecoveryError
  );
