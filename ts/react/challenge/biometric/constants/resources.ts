import { BIOMETRIC_LANGUAGE_RESOURCES } from '../app.config';

/**
 * A type adapted from the base type of `translate`, which we use to limit the
 * keys that can be translated.
 */
type TranslateFunction = (
  resourceId: typeof BIOMETRIC_LANGUAGE_RESOURCES[number],
  parameters?: Record<string, unknown>
) => string;

export const getResources = (translate: TranslateFunction) =>
  ({
    Action: {
      StartBiometricVerification: translate('Action.StartBiometricVerification'),
      Verifying: translate('Action.Verifying'),
      PleaseTryAgain: translate('Action.PleaseTryAgain'),
      Reload: translate('Action.Reload')
    },
    Description: {
      BiometricVerification: translate('Description.BiometricVerification'),
      FollowPrompt: translate('Description.FollowPrompt')
    },
    Label: {
      BiometricVerification: translate('Label.BiometricVerification'),
      CheckingBiometricSupport: translate('Label.CheckingBiometricSupport'),
      FollowPrompt: translate('Label.FollowPrompt'),
      RetryAttempt: translate('Label.RetryAttempt')
    },
    Message: {
      Default: translate('Message.Error.Default'),
      BiometricNotSupported: translate('Message.Error.BiometricNotSupported'),
      BiometricNotEnrolled: translate('Message.Error.BiometricNotEnrolled'),
      VerificationFailed: translate('Message.Error.VerificationFailed'),
      UserCancelled: translate('Message.Error.UserCancelled'),
      Timeout: translate('Message.Error.Timeout')
    }
  } as const);

export type BiometricResources = ReturnType<typeof getResources>;
