import React, { useEffect, useState } from 'react';
import { Route, Switch, useHistory } from 'react-router';
import { Modal } from 'react-style-guide';
import usePlatformSupportsPasskeyAndSecurityKey from '../../../common/hooks/usePlatformSupportsPasskeyAndSecurityKey';
import useTwoStepVerificationContext from '../hooks/useTwoStepVerificationContext';
import {
  GetMetadataReturnType,
  TwoStepCopyEnrollmentStateCensored,
  TwoStepVerificationError
} from '../../../../common/request/types/twoStepVerification';
import InlineChallenge from '../../../common/inlineChallenge';
import InlineChallengeBody from '../../../common/inlineChallengeBody';
import { InlineChallengeFooter } from '../../../common/inlineChallengeFooter';
import { FooterButtonConfig, FragmentModalFooter } from '../../../common/modalFooter';
import { FragmentModalHeader, HeaderButtonType } from '../../../common/modalHeader';
import { TIMEOUT_BEFORE_CALLBACK_MILLISECONDS } from '../app.config';
import MediaTypeList from '../components/mediaTypeList';
import SwitchMediaType from '../components/switchMediaType';
import {
  mapTwoStepVerificationErrorToChallengeErrorCode,
  mapTwoStepVerificationErrorToResource,
  TwoStepVerificationResources
} from '../constants/resources';
import { mediaTypeToPath, useActiveMediaType } from '../hooks/useActiveMediaType';
import { ActionType, MediaType } from '../interface';
import { TwoStepVerificationAction, TwoStepVerificationActionType } from '../store/action';
import AuthenticatorInput from './authenticatorInput';
import EmailInput from './emailInput';
import RecoveryCodeInput from './recoveryCodeInput';
import SecurityKeyInput from './securityKeyInput';
import SmsInput from './smsInput';
import CD2SVInput from './cd2svInput';
import PasskeyInput from './passkeyInput';
import PasswordInput from './passwordInput';
import QuickSignInInput from './quickSignInInput';
import { RequestService } from '../../../../common/request';
import { EventService } from '../services/eventService';

export type LoadChallengeProps = {
  setPageLoadError: React.Dispatch<React.SetStateAction<string | null>>;
  metadata: GetMetadataReturnType | null;
  requestService: RequestService;
  setUserEmailCopy: React.Dispatch<React.SetStateAction<string>>;
  userId: string;
  challengeId: string;
  actionType: ActionType;
  dispatch: React.Dispatch<TwoStepVerificationAction>;
  resources: TwoStepVerificationResources;
  // Annoying to type because of namespace collision...
  history: { replace: (val: string) => void };
  eventService: EventService;
  setHasSentEmailCode: React.Dispatch<React.SetStateAction<boolean>>;
  platformSupportsPasskey: boolean | null;
  platformSupportsSecurityKey: boolean | null;
};

// This function is extracted as a module export to piece-wise add test coverage to this file.
// The routing performed in loadChallenge is sufficiently complex that extracting this out of the
// closure of the main component is probably worth the code duplication.
//
// Idempotent function (no cleanup required):
export const loadChallenge = async ({
  setPageLoadError,
  setUserEmailCopy,
  metadata,
  requestService,
  userId,
  challengeId,
  actionType,
  dispatch,
  resources,
  history,
  eventService,
  setHasSentEmailCode,
  platformSupportsPasskey,
  platformSupportsSecurityKey
}: LoadChallengeProps): Promise<void> => {
  setPageLoadError(null);
  if (metadata !== null) {
    return;
  }

  // Wait for platform support detection to complete
  if (platformSupportsPasskey === null || platformSupportsSecurityKey === null) {
    return;
  }

  // Retrieve user configuration state.
  const resultUserConfiguration = await requestService.twoStepVerification.getUserConfiguration(
    userId,
    {
      challengeId,
      actionType
    }
  );

  if (resultUserConfiguration.isError) {
    if (
      resultUserConfiguration.error === TwoStepVerificationError.INVALID_USER_ID ||
      resultUserConfiguration.error === TwoStepVerificationError.INVALID_CHALLENGE_ID
    ) {
      dispatch({
        type: TwoStepVerificationActionType.SET_CHALLENGE_INVALIDATED,
        errorCode: mapTwoStepVerificationErrorToChallengeErrorCode(resultUserConfiguration.error)
      });
    } else {
      setPageLoadError(
        mapTwoStepVerificationErrorToResource(resources, resultUserConfiguration.error)
      );
    }
    return;
  }

  // Retrieve metadata state.
  const resultMetadata = await requestService.twoStepVerification.getMetadata({
    userId,
    challengeId,
    actionType,
    mediaType: resultUserConfiguration.value.primaryMediaType as MediaType
  });
  if (resultMetadata.isError) {
    if (
      resultMetadata.error === TwoStepVerificationError.INVALID_USER_ID ||
      resultMetadata.error === TwoStepVerificationError.INVALID_CHALLENGE_ID
    ) {
      dispatch({
        type: TwoStepVerificationActionType.SET_CHALLENGE_INVALIDATED,
        errorCode: mapTwoStepVerificationErrorToChallengeErrorCode(resultMetadata.error)
      });
    } else {
      setPageLoadError(mapTwoStepVerificationErrorToResource(resources, resultMetadata.error));
    }
    return;
  }

  // Cache user email here instead of in the email input component to avoid flickering after
  // the modal renders.
  if (resultMetadata.value.twoStepCopyTextEnrollmentStatus === TwoStepCopyEnrollmentStateCensored) {
    const { maskedUserEmail, isUserU13 } = resultMetadata.value;
    const u13NormalizedCopyThunk = isUserU13
      ? resources.Label.EnterEmailCodeSanitizedEmailU13
      : resources.Label.EnterEmailCodeSanitizedEmail;

    setUserEmailCopy(u13NormalizedCopyThunk(maskedUserEmail));
  }

  // Set metadata state.
  dispatch({
    type: TwoStepVerificationActionType.SET_METADATA,
    metadata: resultMetadata.value
  });

  // Set user configuration state (including inferred media type info).
  let primaryMediaType =
    MediaType[resultUserConfiguration.value.primaryMediaType as keyof typeof MediaType] || null;

  // Get the user's originally configured methods (before platform filtering)
  const originalEnabledMethods = resultUserConfiguration.value.methods.filter(
    ({ enabled }) => enabled
  );

  // Filter enabled media types based on platform support
  const newEnabledMediaTypes = originalEnabledMethods
    .map(
      ({ mediaType: enabledMediaType }) =>
        MediaType[enabledMediaType as keyof typeof MediaType] || null
    )
    // Only keep passkey & security key if supported on the platform
    .filter(mediaType => {
      if (mediaType === MediaType.Passkey) {
        return platformSupportsPasskey;
      }

      // Only keep security key if supported on the platform
      if (mediaType === MediaType.SecurityKey) {
        return platformSupportsSecurityKey;
      }

      // Keep the other methods by default
      return true;
    });

  // Redirect to QuickSignIn if user has methods configured but none are available on this platform
  const shouldRedirectToQuickSignIn =
    originalEnabledMethods.length > 0 && newEnabledMediaTypes.length === 0;

  if (shouldRedirectToQuickSignIn) {
    primaryMediaType = MediaType.QuickSignIn;
  }

  if (primaryMediaType === MediaType.SecurityKey && !platformSupportsSecurityKey) {
    primaryMediaType = MediaType.Authenticator;
  }

  let primaryMethodChanged = false;
  if (primaryMediaType === MediaType.Passkey && !platformSupportsPasskey) {
    if (newEnabledMediaTypes.length > 0) {
      primaryMethodChanged = true;
      // eslint-disable-next-line prefer-destructuring
      primaryMediaType = newEnabledMediaTypes[0]!;
    }
  }

  history.replace(mediaTypeToPath(primaryMediaType));
  if (primaryMediaType === MediaType.Email) {
    if (primaryMethodChanged) {
      eventService.sendEmailResendRequestedEvent();
      const emailResult = await requestService.twoStepVerification.sendEmailCode(userId, {
        challengeId,
        actionType
      });
      if (emailResult.isError) {
        if (
          emailResult?.error === TwoStepVerificationError.INVALID_USER_ID ||
          emailResult?.error === TwoStepVerificationError.INVALID_CHALLENGE_ID
        ) {
          dispatch({
            type: TwoStepVerificationActionType.SET_CHALLENGE_INVALIDATED,
            errorCode: mapTwoStepVerificationErrorToChallengeErrorCode(emailResult.error)
          });
        }
      }
    }
    setHasSentEmailCode(!primaryMethodChanged);
  }
  // Track unexpected event where no valid 2SV methods are returned for a user with 2SV enabled.
  if (newEnabledMediaTypes.length === 0 || !primaryMediaType) {
    eventService.sendNoEnabledMethodsReturnedEvent(
      primaryMediaType,
      actionType,
      resultUserConfiguration.value.methods.length
    );
  }

  dispatch({
    type: TwoStepVerificationActionType.SET_USER_CONFIGURATION,
    userConfiguration: resultUserConfiguration.value,
    enabledMediaTypes: newEnabledMediaTypes
  });

  eventService.sendUserConfigurationLoadedEvent(primaryMediaType, actionType);
};

/**
 * A container element for the 2SV UI.
 */
const TwoStepVerification: React.FC = () => {
  const {
    state: {
      userId,
      challengeId,
      actionType,
      renderInline,
      metadata,
      enabledMediaTypes,
      resources,
      eventService,
      metricsService,
      requestService,
      onModalChallengeAbandoned,
      isModalVisible
    },
    dispatch
  } = useTwoStepVerificationContext();
  const activeMediaType = useActiveMediaType();
  const history = useHistory();
  const {
    platformSupportsPasskey,
    platformSupportsSecurityKey
  } = usePlatformSupportsPasskeyAndSecurityKey({
    isAndroidSecurityKeyEnabled: metadata?.isAndroidSecurityKeyEnabled ?? false
  });

  /*
   * Component State
   */

  const [hasSentEmailCode, setHasSentEmailCode] = useState<boolean>(false);
  const [hasSentSmsCode, setHasSentSmsCode] = useState<boolean>(false);
  const [pageLoadError, setPageLoadError] = useState<string | null>(null);
  const [requestInFlight, setRequestInFlight] = useState<boolean>(false);
  const [modalTitleText, setModalTitleText] = useState<string>(resources.Label.TwoStepVerification);
  const [showChangeMediaType, setShowChangeMediaType] = useState<boolean>(true);
  const [userEmailCopy, setUserEmailCopy] = useState<string>(resources.Label.EnterEmailCode);

  /*
   * Event Handlers
   */

  const closeModal = () => {
    dispatch({
      type: TwoStepVerificationActionType.HIDE_MODAL_CHALLENGE
    });

    eventService.sendChallengeAbandonedEvent(activeMediaType, actionType);
    metricsService.fireAbandonedEvent();

    // Attempt to retract dialog on cross device but ignore errors if they occur.
    if (activeMediaType === MediaType.CrossDevice) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      requestService.twoStepVerification.retractCrossDevice(userId, {
        challengeId,
        actionType
      });
    }
    if (onModalChallengeAbandoned !== null) {
      // Set a timeout to ensure that any events and metrics have a better
      // chance to complete.
      setTimeout(
        () =>
          onModalChallengeAbandoned(() =>
            dispatch({
              type: TwoStepVerificationActionType.SHOW_MODAL_CHALLENGE
            })
          ),
        TIMEOUT_BEFORE_CALLBACK_MILLISECONDS
      );
    }
  };

  /*
   * Effects
   */
  const loadChallengeProps = {
    setPageLoadError,
    setUserEmailCopy,
    metadata,
    requestService,
    userId,
    challengeId,
    actionType,
    dispatch,
    resources,
    history,
    eventService,
    setHasSentEmailCode,
    platformSupportsPasskey,
    platformSupportsSecurityKey
  };

  // Effect to retrieve 2SV metadata and user configuration:
  useEffect(() => {
    // eslint-disable-next-line no-void
    void loadChallenge(loadChallengeProps);
  }, [platformSupportsPasskey, platformSupportsSecurityKey]);

  /*
   * Render Properties
   */

  const reloadButton: FooterButtonConfig = {
    content: resources.Action.Reload,
    label: resources.Action.Reload,
    enabled: pageLoadError !== null,
    action: () => loadChallenge(loadChallengeProps)
  };

  /*
   * Rendering Helpers
   */

  const renderMediaTypeWithChildren = (children: React.ReactFragment) => {
    return (
      <Switch>
        <Route path={mediaTypeToPath(MediaType.Authenticator)}>
          <AuthenticatorInput
            requestInFlight={requestInFlight}
            setRequestInFlight={setRequestInFlight}>
            {children}
          </AuthenticatorInput>
        </Route>
        <Route path={mediaTypeToPath(MediaType.Email)}>
          <EmailInput
            requestInFlight={requestInFlight}
            setRequestInFlight={setRequestInFlight}
            userEmailCopy={userEmailCopy}>
            {children}
          </EmailInput>
        </Route>
        <Route path={mediaTypeToPath(MediaType.RecoveryCode)}>
          <RecoveryCodeInput
            requestInFlight={requestInFlight}
            setRequestInFlight={setRequestInFlight}>
            {children}
          </RecoveryCodeInput>
        </Route>
        <Route path={mediaTypeToPath(MediaType.SMS)}>
          <SmsInput requestInFlight={requestInFlight} setRequestInFlight={setRequestInFlight}>
            {children}
          </SmsInput>
        </Route>
        <Route path={mediaTypeToPath(MediaType.SecurityKey)}>
          <SecurityKeyInput
            requestInFlight={requestInFlight}
            setRequestInFlight={setRequestInFlight}>
            {children}
          </SecurityKeyInput>
        </Route>
        <Route path={mediaTypeToPath(MediaType.CrossDevice)}>
          <CD2SVInput
            requestInFlight={requestInFlight}
            setRequestInFlight={setRequestInFlight}
            setModalTitleText={setModalTitleText}
            setShowChangeMediaType={setShowChangeMediaType}>
            {children}
          </CD2SVInput>
        </Route>
        <Route path={mediaTypeToPath(MediaType.Passkey)}>
          <PasskeyInput requestInFlight={requestInFlight} setRequestInFlight={setRequestInFlight}>
            {children}
          </PasskeyInput>
        </Route>
        <Route path={mediaTypeToPath(MediaType.Password)}>
          <PasswordInput requestInFlight={requestInFlight} setRequestInFlight={setRequestInFlight}>
            {children}
          </PasswordInput>
        </Route>
        <Route path={mediaTypeToPath(MediaType.QuickSignIn)}>
          <QuickSignInInput setModalTitleText={setModalTitleText}>{children}</QuickSignInInput>
        </Route>
        <Route>
          <MediaTypeList
            hasSentEmailCode={hasSentEmailCode}
            setHasSentEmailCode={setHasSentEmailCode}
            hasSentSmsCode={hasSentSmsCode}
            setHasSentSmsCode={setHasSentSmsCode}
            requestInFlight={requestInFlight}
            setRequestInFlight={setRequestInFlight}
            setModalTitleText={setModalTitleText}>
            {children}
          </MediaTypeList>
        </Route>
      </Switch>
    );
  };

  const getPageContent = () => {
    const BodyElement = renderInline ? InlineChallengeBody : Modal.Body;
    const FooterElement = renderInline ? InlineChallengeFooter : FragmentModalFooter;

    if (pageLoadError) {
      return (
        <React.Fragment>
          <BodyElement>
            <p>{pageLoadError}</p>
          </BodyElement>
          <FooterElement positiveButton={reloadButton} negativeButton={null} />
        </React.Fragment>
      );
    }

    if (!metadata) {
      return (
        <BodyElement>
          <span className='spinner spinner-default spinner-no-margin modal-margin-bottom-large' />
        </BodyElement>
      );
    }

    return renderMediaTypeWithChildren(
      <React.Fragment>
        {activeMediaType && enabledMediaTypes.length > 1 && showChangeMediaType && (
          <SwitchMediaType
            requestInFlight={requestInFlight}
            originalMediaType={activeMediaType}
            actionType={actionType}
          />
        )}
      </React.Fragment>
    );
  };

  /*
   * Component Markup
   */

  return renderInline ? (
    <InlineChallenge titleText={modalTitleText}>{getPageContent()}</InlineChallenge>
  ) : (
    <Modal className='modal-modern' show={isModalVisible} onHide={closeModal} backdrop='static'>
      <FragmentModalHeader
        headerText={modalTitleText}
        buttonType={HeaderButtonType.CLOSE}
        buttonAction={closeModal}
        buttonEnabled={!requestInFlight}
        headerInfo={null}
      />
      {getPageContent()}
    </Modal>
  );
};

export default TwoStepVerification;
