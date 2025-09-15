import Persona from 'persona';
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { DeviceMeta } from 'Roblox';
import LoadingPage from './LoadingPage';
import { IDVPage } from './enums';
import { useAppDispatch } from './store';
import {
  fetchIDVerificationStatus,
  resetVerificationStore,
  selectIDVState,
  selectLoading,
  setLoading,
  startIDVerification
} from './verificationSlice';
import useBiometricContext from '../../hooks/useBiometricContext';
import { OnChallengeDisplayedData, ErrorCode } from '../../interface';
import { BiometricActionType } from '../../store/action';
import {
  EMBEDDED_FLOW_POLLING_INTERVAL,
  EMBEDDED_FLOW_POLLING_MAX_TIMES,
  POLLING_INTERVAL,
  POLLING_TIMEOUT
} from './settings';

function PersonaLivenessCheck({
  onChallengeDisplayed
}: {
  onChallengeDisplayed: (data: OnChallengeDisplayedData) => unknown;
}): React.ReactElement {
  const endTime = useRef(Number(new Date()) + POLLING_TIMEOUT);

  const dispatch = useAppDispatch();
  const loading = useSelector(selectLoading);
  const { page } = useSelector(selectIDVState);
  const pageRef = useRef(page);
  const embeddedFlowPollingRef = useRef(false);
  const verificationLinkOpenedRef = useRef(false);
  const isTimedOutRef = useRef(false);

  // Update pageRef when page changes
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const isWebview = (DeviceMeta && DeviceMeta().isInApp) ?? false;
  const IDVState = useSelector(selectIDVState);
  const { vendorVerificationData } = IDVState;
  const { sessionIdentifier } = vendorVerificationData;

  const timeoutError = 'Persona Liveness Check timed out';

  const {
    state: { biometricType, eventService, metricsService },
    dispatch: biometricDispatch
  } = useBiometricContext();

  // methods shared by both webview and non-webview
  useEffect(() => {
    // Clear local IDV information at start
    dispatch(resetVerificationStore());
    dispatch(setLoading(true));
    // Reset timeout flag
    isTimedOutRef.current = false;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    dispatch(startIDVerification());
    if (isWebview) {
      endTime.current = Number(new Date()) + POLLING_TIMEOUT;
    }

    // Cleanup function to reset state when component unmounts
    return () => {
      isTimedOutRef.current = true;
    };
  }, []);

  // only for webview: use hosted flow
  const IDVComponent = null;

  // webview polling
  useEffect(() => {
    // Early return if already timed out
    if (isTimedOutRef.current) {
      return;
    }

    // Check for timeout first
    if (Number(new Date()) > endTime.current) {
      isTimedOutRef.current = true;
      dispatch(setLoading(false));
      eventService.sendChallengeInvalidatedEvent(timeoutError);
      metricsService.fireChallengeInvalidatedEvent();
      biometricDispatch({
        type: BiometricActionType.SET_CHALLENGE_INVALIDATED,
        onChallengeInvalidatedData: {
          errorCode: ErrorCode.VERIFICATION_FAILED,
          errorMessage: timeoutError
        }
      });
      return;
    }

    // Dispatch IDVState is not loading && startIDVerification is successfully called && endScreen is NOT set && does NOT times out
    // This occurs when the user is in the hosted/webview flow and is in the middle of the flow, after having already started the flow
    // and gotten the verification link.
    if (
      isWebview &&
      !IDVState.loading &&
      vendorVerificationData.verificationLink != null &&
      IDVState.page !== IDVPage.Complete
    ) {
      const timeoutId = setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        dispatch(fetchIDVerificationStatus(vendorVerificationData.sessionIdentifier));
      }, POLLING_INTERVAL);

      // Cleanup function to clear timeout if component unmounts or effect runs again
      // eslint-disable-next-line consistent-return
      return () => clearTimeout(timeoutId);
    }
  }, [IDVState.loading, IDVState.page]);

  // page complete
  useEffect(() => {
    if (page === IDVPage.Complete) {
      // Stop any further polling
      isTimedOutRef.current = true;
      dispatch(setLoading(false));
      eventService.sendChallengeCompletedEvent('Persona Liveness Check completed');
      metricsService.fireChallengeCompletedEvent();
      biometricDispatch({
        type: BiometricActionType.SET_CHALLENGE_COMPLETED,
        onChallengeCompletedData: {
          biometricType
        }
      });
    }
  }, [page]);

  // open verification link in new tab
  useEffect(() => {
    // Automatically open verification link in new tab when available
    if (
      isWebview &&
      vendorVerificationData.verificationLink &&
      !verificationLinkOpenedRef.current
    ) {
      verificationLinkOpenedRef.current = true;
      const newWindow = window.open(vendorVerificationData.verificationLink, '_blank');

      // Try to focus the new tab
      if (newWindow) {
        newWindow.focus();
        // Additional attempt to focus after a brief delay
        setTimeout(() => {
          newWindow.focus();
        }, 100);
      }
    }
  }, [vendorVerificationData.verificationLink, isWebview]);

  // only for non-webview: use embedded flow
  useEffect(() => {
    if (!isWebview && sessionIdentifier) {
      const personaClient = new Persona.Client({
        inquiryId: sessionIdentifier,
        onReady: () => {
          eventService.sendChallengeInitializedEvent();
          metricsService.fireChallengeInitializedEvent();
          personaClient.open();
          dispatch(setLoading(false));
          onChallengeDisplayed({ displayed: true });
        },
        onComplete: ({ inquiryId, status, fields }) => {
          if (embeddedFlowPollingRef.current) return; // prevent multiple polling loops
          dispatch(setLoading(true));
          embeddedFlowPollingRef.current = true;
          let times = 0;
          const intervalId = setInterval(() => {
            if (pageRef.current === IDVPage.Complete || times >= EMBEDDED_FLOW_POLLING_MAX_TIMES) {
              clearInterval(intervalId);
              dispatch(setLoading(false));
              eventService.sendChallengeCompletedEvent(status);
              metricsService.fireChallengeCompletedEvent();
              biometricDispatch({
                type: BiometricActionType.SET_CHALLENGE_COMPLETED,
                onChallengeCompletedData: {
                  biometricType
                }
              });
            } else {
              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              dispatch(fetchIDVerificationStatus(sessionIdentifier));
              times += 1;
            }
          }, EMBEDDED_FLOW_POLLING_INTERVAL);
        },
        onCancel: ({ inquiryId, sessionToken }) => {
          // Clear polling reference to prevent any ongoing polling
          embeddedFlowPollingRef.current = false;

          // Send events
          eventService.sendChallengeInvalidatedEvent('Persona cancelled');
          metricsService.fireChallengeInvalidatedEvent();

          // Invalidate the biometric challenge
          biometricDispatch({
            type: BiometricActionType.SET_CHALLENGE_INVALIDATED,
            onChallengeInvalidatedData: {
              errorCode: ErrorCode.VERIFICATION_FAILED,
              errorMessage: 'Persona cancelled'
            }
          });
        },
        onError: error => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          dispatch(fetchIDVerificationStatus(sessionIdentifier));
          eventService.sendChallengeInvalidatedEvent('Persona error');
          metricsService.fireChallengeInvalidatedEvent();
          biometricDispatch({
            type: BiometricActionType.SET_CHALLENGE_INVALIDATED,
            onChallengeInvalidatedData: {
              errorCode: ErrorCode.UNKNOWN,
              errorMessage: 'Persona error'
            }
          });
        }
      });
    }
  }, [sessionIdentifier, biometricType, eventService, metricsService]);

  // IDVPage.Complete will be shown for both webview/non-webview to show completion/error state after IDV flow.
  // Loading is only for embedded flow to show loader when embedded flow component is loading as well as transitioning post IDV completion.
  // All other IDVComponent will be only shown for hosted flow since it's explaining which step of IDV the user is on in the hosted flow.
  // TODO: clean up the screens so that completion page is pulled out of the group of other IDV status pages that are only required for hosted flow.

  return <React.Fragment>{loading ? <LoadingPage /> : IDVComponent}</React.Fragment>;
}

export default PersonaLivenessCheck;
