import { httpService } from 'core-utilities';
import { TSecureAuthIntent } from 'core-roblox-utilities';
import { Result } from '../../result';
import { toResult } from '../common';
import * as AuthApi from '../types/auth';

export const startPreAuthPasskeyRegistration = (
  username: string
): Promise<Result<AuthApi.StartRegistrationReturnType, AuthApi.AuthApiError | null>> => {
  const additionalProcessingFunction = (
    startRegistrationResult: AuthApi.StartRegistrationReturnType
  ) => {
    return {
      creationOptions: JSON.parse(
        startRegistrationResult.creationOptions as string
      ) as CredentialCreationOptions,
      sessionId: startRegistrationResult.sessionId
    };
  };
  return toResult(
    httpService.post(AuthApi.START_PRE_AUTH_REGISTRATION_CONFIG, { username }),
    AuthApi.AuthApiError,
    additionalProcessingFunction
  );
};

export const startPasskeyRegistration = (): Promise<
  Result<AuthApi.StartRegistrationReturnType, AuthApi.AuthApiError | null>
> => {
  const additionalProcessingFunction = (
    startRegistrationResult: AuthApi.StartRegistrationReturnType
  ) => {
    return {
      creationOptions: JSON.parse(
        startRegistrationResult.creationOptions as string
      ) as CredentialCreationOptions,
      sessionId: startRegistrationResult.sessionId
    };
  };
  return toResult(
    httpService.post(AuthApi.START_REGISTRATION_CONFIG, {}),
    AuthApi.AuthApiError,
    additionalProcessingFunction
  );
};

export const finishPasskeyRegistration = (
  sessionId: string,
  credentialNickname: string,
  attestationResponse: string
): Promise<Result<AuthApi.FinishRegistrationReturnType, AuthApi.AuthApiError | null>> =>
  toResult(
    httpService.post(AuthApi.FINISH_REGISTRATION_CONFIG, {
      sessionId,
      credentialNickname,
      attestationResponse
    }),
    AuthApi.AuthApiError
  );

export const deletePasskeyBatch = (
  credentialNicknames: string[]
): Promise<Result<AuthApi.DeleteCredentialBatchReturnType, AuthApi.AuthApiError | null>> =>
  toResult(
    httpService.post(AuthApi.DELETE_CREDENTIAL_BATCH_CONFIG, {
      credentialNicknames
    }),
    AuthApi.AuthApiError
  );

export const listAllCredentials = (
  options: { all: boolean } = { all: true }
): Promise<Result<AuthApi.ListCredentialsReturnType, AuthApi.AuthApiError | null>> =>
  toResult(httpService.post(AuthApi.LIST_CREDENTIALS_CONFIG, options), AuthApi.AuthApiError);

export const resetPassword = (
  targetType: string,
  ticket: string,
  userId: number,
  password: string,
  passwordRepeated: string,
  twoStepVerificationChallengeId?: string,
  twoStepVerificationToken?: string,
  accountBlob?: string,
  secureAuthenticationIntent?: TSecureAuthIntent | null,
  passkeySessionId?: string,
  passkeyRegistrationResponse?: string,
  newEmail?: string
): Promise<Result<AuthApi.ResetPasswordReturnType, AuthApi.PasswordResetError | null>> =>
  toResult(
    httpService.post(AuthApi.RESET_PASSWORD_CONFIG, {
      targetType,
      ticket,
      userId,
      password,
      passwordRepeated,
      twoStepVerificationChallengeId,
      twoStepVerificationToken,
      accountBlob,
      secureAuthenticationIntent,
      passkeySessionId,
      passkeyRegistrationResponse,
      newEmail
    }),
    AuthApi.PasswordResetError
  );
