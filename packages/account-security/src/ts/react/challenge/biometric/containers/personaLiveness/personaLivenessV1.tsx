import Persona from 'persona';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { DeviceMeta } from 'Roblox';
import LoadingPage from './LoadingPage';
import { useAppDispatch } from './store';
import {
  fetchVerificationStatus,
  resetVerificationStore,
  selectVendorData,
  selectVerificationStatus,
  startVerification,
  setVerificationStatus,
  VerificationStatusType
} from './verificationSlice';
import useBiometricContext from '../../hooks/useBiometricContext';
import { ErrorCode } from '../../interface';
import { BiometricActionType } from '../../store/action';
import {
  EMBEDDED_FLOW_POLLING_INTERVAL,
  EMBEDDED_FLOW_POLLING_MAX_TIMES,
  POLLING_INTERVAL,
  POLLING_MAX_TIMES
} from './settings';
import PersonaLivenessHostedModal from './personaLivenessHostedModal';

function PersonaLivenessCheck(): React.ReactElement {
  const dispatch = useAppDispatch();

  const verificationStatus = useSelector(selectVerificationStatus);
  const loading =
    verificationStatus.status === VerificationStatusType.Init ||
    verificationStatus.status === VerificationStatusType.Loading ||
    verificationStatus.status === VerificationStatusType.Polling;

  const pollingIntervalRef = useRef<number | undefined>(undefined);

  const isWebview = (DeviceMeta && DeviceMeta().isInApp) ?? false;
  const { sessionIdentifier, verificationLink } = useSelector(selectVendorData);
  const [hostedLink, setHostedLink] = useState<string | null>(null);

  // There is a bit of a hacky use of this ref to prevent multiple initialization of Persona client.
  // The challenge component sticks around somehow after abandonment. Meanwhile, since redux state
  // is global, when reinitializing the flow if you are not careful, the useEffect hook to initialize
  // the client will be triggered again. Therefore, we never reset this ref to null even after destroying
  // the and use it as a condition to see if the component has already in the past initialized a client.
  const personaClient = useRef<typeof Persona.Client.prototype | null>(null);

  const {
    state: { biometricType, eventService, metricsService, onChallengeDisplayed },
    dispatch: biometricDispatch
  } = useBiometricContext();

  const startPolling = useCallback(() => {
    const pollingInterval = isWebview ? POLLING_INTERVAL : EMBEDDED_FLOW_POLLING_INTERVAL;
    const pollingMaxTimes = isWebview ? POLLING_MAX_TIMES : EMBEDDED_FLOW_POLLING_MAX_TIMES;

    let times = 0;
    pollingIntervalRef.current = setInterval(() => {
      if (times >= pollingMaxTimes || sessionIdentifier === null) {
        clearInterval(pollingIntervalRef.current);

        biometricDispatch({
          type: BiometricActionType.SET_CHALLENGE_INVALIDATED,
          onChallengeInvalidatedData: {
            errorCode: ErrorCode.UNKNOWN,
            errorMessage: 'Persona Liveness Check timed out'
          }
        });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        dispatch(fetchVerificationStatus(sessionIdentifier));
        times += 1;
      }
    }, pollingInterval);
  }, [dispatch, biometricDispatch, isWebview, sessionIdentifier]);

  // Component initalization.
  useEffect(() => {
    dispatch(resetVerificationStore());

    // Launch verification flow.
    dispatch(setVerificationStatus({ status: VerificationStatusType.Loading }));
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    dispatch(startVerification());

    return () => {
      // Cleanup any existing persona client.
      if (personaClient.current !== null) {
        personaClient.current.destroy();
        // We do not set the ref to null to prevent future re-render.
      }

      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = undefined;
    };
  }, []);

  // Luanch hosted challenge UI when challenge is rendered in webview.
  useEffect(() => {
    // Launches hosted challege UI once the persona session is initialized and verificaiton link
    // is available. For same reason as us checking the embedded flow client ref is null, we make
    // check hostedLink is null to prevent the flow from reinitiating on an old instance that
    // isn't cleaned up properly.
    if (
      isWebview &&
      verificationStatus.status === VerificationStatusType.Loading &&
      verificationLink !== null &&
      hostedLink === null
    ) {
      setHostedLink(verificationLink);
      dispatch(setVerificationStatus({ status: VerificationStatusType.Challenge }));
    }
  }, [verificationStatus.status, verificationLink, hostedLink]);

  // Launch embedded challenge UI once session informaiton is available for case when challenge is rendered in non-webview.
  useEffect(() => {
    if (
      isWebview ||
      sessionIdentifier === null ||
      personaClient.current !== null ||
      verificationStatus.status !== VerificationStatusType.Loading
    ) {
      return;
    }

    personaClient.current = new Persona.Client({
      inquiryId: sessionIdentifier,
      onReady: () => {
        if (personaClient.current === null) {
          return;
        }

        personaClient.current.open();
        dispatch(setVerificationStatus({ status: VerificationStatusType.Challenge }));

        onChallengeDisplayed({ displayed: true });
      },
      onComplete: () => {
        clearInterval(pollingIntervalRef.current);
        startPolling();

        dispatch(setVerificationStatus({ status: VerificationStatusType.Polling }));
      },
      onCancel: () => {
        dispatch(setVerificationStatus({ status: VerificationStatusType.Cancelled }));

        // Abandon the biometric challenge
        biometricDispatch({
          type: BiometricActionType.SET_CHALLENGE_ABANDONED
        });
      },
      onError: _error => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        dispatch(fetchVerificationStatus(sessionIdentifier));

        biometricDispatch({
          type: BiometricActionType.SET_CHALLENGE_INVALIDATED,
          onChallengeInvalidatedData: {
            errorCode: ErrorCode.UNKNOWN,
            errorMessage: 'Persona error'
          }
        });
      }
    });
  }, [sessionIdentifier, verificationStatus.status]);

  // Verification has been successfully completed.
  useEffect(() => {
    if (
      verificationStatus.status === VerificationStatusType.Completed &&
      verificationStatus.error === null
    ) {
      // Stop any further polling
      clearInterval(pollingIntervalRef.current);

      biometricDispatch({
        type: BiometricActionType.SET_CHALLENGE_COMPLETED,
        onChallengeCompletedData: {
          biometricType
        }
      });
    }
  }, [verificationStatus]);

  const hostedModal =
    hostedLink !== null ? (
      <PersonaLivenessHostedModal startPolling={startPolling} verificationLink={hostedLink} />
    ) : null;

  return (
    <React.Fragment>
      {loading && hostedModal === null ? <LoadingPage /> : hostedModal}
    </React.Fragment>
  );
}

export default PersonaLivenessCheck;
