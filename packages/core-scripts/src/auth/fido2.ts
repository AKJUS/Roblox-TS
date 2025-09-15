import { arrayBufferToBase64String, base64StringToArrayBuffer } from "./crypto";

export const base64StringToBase64UrlString = (rawString: string): string =>
  rawString.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

export const base64UrlStringToBase64String = (rawString: string): string => {
  const padding = rawString.length % 4 ? 4 - (rawString.length % 4) : 0;
  return rawString.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(padding);
};

// TODO: old, migrated code
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const convertPublicKeyParametersToStandardBase64 = (options: string) => {
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const makeOptions = JSON.parse(options);
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  makeOptions.publicKey.challenge = base64UrlStringToBase64String(makeOptions.publicKey.challenge);

  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (makeOptions.publicKey.user?.id) {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    makeOptions.publicKey.user.id = base64UrlStringToBase64String(
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-member-access
      makeOptions.publicKey.user.id as unknown as string,
    );
  }

  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (makeOptions.publicKey.allowCredentials) {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    for (const allowCredentials of makeOptions.publicKey.allowCredentials) {
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      allowCredentials.id = base64UrlStringToBase64String(allowCredentials.id);
    }
  }

  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (makeOptions.publicKey.excludeCredentials) {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    for (const excludeCredentials of makeOptions.publicKey.excludeCredentials) {
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      excludeCredentials.id = base64UrlStringToBase64String(
        // TODO: old, migrated code
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-member-access
        excludeCredentials.id as unknown as string,
      );
    }
  }

  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return makeOptions;
};

export const formatCredentialAuthenticationResponseApp = (credentialString: string): string => {
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const credential = JSON.parse(credentialString);
  const publicKeyCredential = {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    id: base64StringToBase64UrlString(credential.id),
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    type: credential.type,
    response: {
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      authenticatorData: base64StringToBase64UrlString(credential.response.authenticatorData),
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      clientDataJSON: base64StringToBase64UrlString(credential.response.clientDataJSON),
    },
  };
  if ("rawId" in credential) {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
    (publicKeyCredential as any).rawId = base64StringToBase64UrlString(credential.rawId);
  }
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if ("signature" in credential.response) {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
    (publicKeyCredential as any).response.signature = base64StringToBase64UrlString(
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      credential.response.signature,
    );
  }
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if ("userHandle" in credential.response) {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
    (publicKeyCredential as any).response.userHandle = base64StringToBase64UrlString(
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      credential.response.userHandle,
    );
  }
  return JSON.stringify(publicKeyCredential);
};

export const formatCredentialRegistrationResponseApp = (credentialString: string): string => {
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const credential = JSON.parse(credentialString);
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (credential.rawId !== undefined) {
    return JSON.stringify({
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      authenticatorAttachment: credential.authenticatorAttachment,
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      id: base64StringToBase64UrlString(credential.id),
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      type: credential.type,
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      rawId: base64StringToBase64UrlString(credential.rawId),
      response: {
        // TODO: old, migrated code
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        attestationObject: base64StringToBase64UrlString(credential.response.attestationObject),
        // TODO: old, migrated code
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        clientDataJSON: base64StringToBase64UrlString(credential.response.clientDataJSON),
      },
    });
  }
  return JSON.stringify({
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    authenticatorAttachment: credential.authenticatorAttachment,
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    id: base64StringToBase64UrlString(credential.id),
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    type: credential.type,
    response: {
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      attestationObject: base64StringToBase64UrlString(credential.response.attestationObject),
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      clientDataJSON: base64StringToBase64UrlString(credential.response.clientDataJSON),
    },
  });
};

// TODO: old, migrated code
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const formatCredentialRequestWeb = (options: string) => {
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const makeAssertionOptions = JSON.parse(options);
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  makeAssertionOptions.publicKey.challenge = base64StringToArrayBuffer(
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-member-access
    makeAssertionOptions.publicKey.challenge as unknown as string,
  );

  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (makeAssertionOptions.publicKey.allowCredentials) {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    for (const allowCredentials of makeAssertionOptions.publicKey.allowCredentials) {
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      allowCredentials.id = base64StringToArrayBuffer(allowCredentials.id);
    }
  }

  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (makeAssertionOptions.publicKey.user?.id) {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    makeAssertionOptions.publicKey.user.id = base64StringToArrayBuffer(
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-member-access
      makeAssertionOptions.publicKey.user.id as unknown as string,
    );
  }
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (makeAssertionOptions.publicKey.excludeCredentials) {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    for (const excludeCredentials of makeAssertionOptions.publicKey.excludeCredentials) {
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-member-access
      excludeCredentials.id = base64StringToArrayBuffer(excludeCredentials.id as unknown as string);
    }
  }
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  return makeAssertionOptions.publicKey;
};

export const formatCredentialAuthenticationResponseWeb = (
  credential: PublicKeyCredential,
): string => {
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const response = credential.response as AuthenticatorAssertionResponse;
  const { authenticatorData, clientDataJSON, signature, userHandle } = response;
  const { rawId } = credential;
  const publicKeyCredential = {
    id: credential.id,
    rawId: base64StringToBase64UrlString(arrayBufferToBase64String(rawId)),
    type: credential.type,
    response: {
      authenticatorData: base64StringToBase64UrlString(
        arrayBufferToBase64String(authenticatorData),
      ),
      clientDataJSON: base64StringToBase64UrlString(arrayBufferToBase64String(clientDataJSON)),
      signature: base64StringToBase64UrlString(arrayBufferToBase64String(signature)),
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      userHandle: base64StringToBase64UrlString(arrayBufferToBase64String(userHandle!)),
    },
  };
  return JSON.stringify(publicKeyCredential);
};

export const formatCredentialRegistrationResponseWeb = (
  credential: PublicKeyCredential,
): string => {
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const response = credential.response as AuthenticatorAttestationResponse;
  const { attestationObject, clientDataJSON } = response;
  const { rawId } = credential;
  return JSON.stringify({
    // For some reason this will always fail to build without an explicit any typecast.
    // Although PublicKeyCredential should always have authenticatorAttachment, the compiler is somehow unaware.
    authenticatorAttachment: credential.authenticatorAttachment,
    id: credential.id,
    rawId: base64StringToBase64UrlString(arrayBufferToBase64String(rawId)),
    type: credential.type,
    response: {
      attestationObject: base64StringToBase64UrlString(
        arrayBufferToBase64String(attestationObject),
      ),
      clientDataJSON: base64StringToBase64UrlString(arrayBufferToBase64String(clientDataJSON)),
    },
  });
};
