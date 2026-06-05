import {
  convertPublicKeyParametersToStandardBase64,
  formatCredentialRequestWeb,
  formatCredentialRegistrationResponseWeb
} from '@rbx/core-scripts/auth/fido2';
import {
  startPasskeyRegistration,
  finishPasskeyRegistration
} from '@rbx/authentication-common/passkey/api';

// security-key-service generates the actual nickname; this client-side value is
// just a placeholder required by the FinishRegistration request shape.
const CREDENTIAL_NICKNAME = 'Passkey';

/**
 * Performs a full WebAuthn passkey registration:
 *   StartRegistration → browser prompt → FinishRegistration
 *
 * Returns `true` on a successful end-to-end registration, `false` otherwise
 * (no platform support, server start/finish error, user cancellation, or any
 * thrown exception). Never throws — callers can drive UI state from the
 * boolean alone.
 */
export const registerPasskey = async (): Promise<boolean> => {
  if (typeof PublicKeyCredential === 'undefined') {
    return false;
  }

  try {
    const startResult = await startPasskeyRegistration();
    if (startResult.isError) {
      return false;
    }

    const { creationOptions, sessionId } = startResult.value;
    const options = convertPublicKeyParametersToStandardBase64(JSON.stringify(creationOptions));
    const publicKey = formatCredentialRequestWeb(JSON.stringify(options));

    const credential = await navigator.credentials.create({ publicKey });
    if (!(credential instanceof PublicKeyCredential)) {
      return false;
    }

    const attestation = formatCredentialRegistrationResponseWeb(credential);
    const finishResult = await finishPasskeyRegistration(
      sessionId,
      CREDENTIAL_NICKNAME,
      attestation
    );
    return !finishResult.isError;
  } catch {
    return false;
  }
};
