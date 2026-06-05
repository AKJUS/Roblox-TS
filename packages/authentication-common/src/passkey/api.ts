import { post } from "@rbx/core-scripts/http";
import { Result } from "./result";
import { toResult } from "./requestUtils";
import {
  AuthApiError,
  StartRegistrationReturnType,
  FinishRegistrationReturnType,
  FinishARPreAuthRegistrationReturnType,
  DeleteCredentialBatchReturnType,
  START_REGISTRATION_CONFIG,
  START_PRE_AUTH_REGISTRATION_CONFIG,
  FINISH_REGISTRATION_CONFIG,
  FINISH_AR_PRE_AUTH_REGISTRATION_CONFIG,
  DELETE_CREDENTIAL_BATCH_CONFIG,
} from "./types";

export { Result } from "./result";
export { AuthApiError } from "./types";
export type {
  StartRegistrationReturnType,
  FinishRegistrationReturnType,
  FinishARPreAuthRegistrationReturnType,
  DeleteCredentialBatchReturnType,
} from "./types";

export const startPasskeyRegistration = (): Promise<
  Result<StartRegistrationReturnType, AuthApiError | null>
> => {
  const additionalProcessingFunction = (startRegistrationResult: StartRegistrationReturnType) => {
    /* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
    const creationOptions = JSON.parse(
      startRegistrationResult.creationOptions as string,
    ) as CredentialCreationOptions;
    /* eslint-enable @typescript-eslint/no-unsafe-type-assertion */
    return { creationOptions, sessionId: startRegistrationResult.sessionId };
  };
  return toResult(post(START_REGISTRATION_CONFIG, {}), AuthApiError, additionalProcessingFunction);
};

export const startPreAuthPasskeyRegistration = (
  username: string,
): Promise<Result<StartRegistrationReturnType, AuthApiError | null>> => {
  const additionalProcessingFunction = (startRegistrationResult: StartRegistrationReturnType) => {
    /* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
    const creationOptions = JSON.parse(
      startRegistrationResult.creationOptions as string,
    ) as CredentialCreationOptions;
    /* eslint-enable @typescript-eslint/no-unsafe-type-assertion */
    return { creationOptions, sessionId: startRegistrationResult.sessionId };
  };
  return toResult(
    post(START_PRE_AUTH_REGISTRATION_CONFIG, { username }),
    AuthApiError,
    additionalProcessingFunction,
  );
};

export const finishPasskeyRegistration = (
  sessionId: string,
  credentialNickname: string,
  attestationResponse: string,
): Promise<Result<FinishRegistrationReturnType, AuthApiError | null>> =>
  toResult(
    post(FINISH_REGISTRATION_CONFIG, {
      sessionId,
      credentialNickname,
      attestationResponse,
    }),
    AuthApiError,
  );

export const finishARPreAuthPasskeyRegistration = (
  recoverySession: string,
  userId: number,
  passkeySessionId: string,
  passkeyRegistrationResponse: string,
  isPostRecovery?: boolean,
): Promise<Result<FinishARPreAuthRegistrationReturnType, AuthApiError | null>> =>
  toResult(
    post(FINISH_AR_PRE_AUTH_REGISTRATION_CONFIG, {
      recoverySession,
      passkeySessionId,
      passkeyRegistrationResponse,
      userId,
      isPostRecovery,
    }),
    AuthApiError,
  );

export const deletePasskeyBatch = (
  credentialNicknames: string[],
  passkeyCount: number,
): Promise<Result<DeleteCredentialBatchReturnType, AuthApiError | null>> =>
  toResult(
    post(DELETE_CREDENTIAL_BATCH_CONFIG, {
      credentialNicknames,
      passkeyCount,
    }),
    AuthApiError,
  );
