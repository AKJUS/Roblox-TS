import Persona from 'persona';
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useTheme, TranslateFunction } from 'react-utilities';
import { DeviceMeta, ExperimentationService, TFeatureSpecificData, Intl } from 'Roblox';
import openVerificationLink from '../../utils/verificationUtils';
import VerificationCompletePage from './components/VerificationCompletePage';
import FAEQRCodeContainer from './FAEQRCodeContainer';
import useExperiments from '../../hooks/useExperiments';
import { faeQrCodeExperimentLayer } from '../../accessManagement/constants/experimentConstants';
import {
  fetchFeatureAccess,
  selectAmpFeatureCheckData,
  selectFeatureAccess,
  selectFeatureName,
  selectNamespace
} from '../../accessManagement/accessManagementSlice';
import LoadingPage from '../../accessManagement/components/LoadingPage';
import { VerificationStatusCode, FlowType, Access } from '../../enums';
import { useAppDispatch } from '../../store';
import FAEEventConstants from './constants/eventConstants';
import {
  sendFAEModalShownEvent,
  sendFAEButtonClickEvent,
  sendFAEFormInteractionEvent,
  sendFAEMessageShownEvent,
  sendFAEPageLoadEvent
} from './services/FaeEventService';
import {
  fetchIDVerificationStatus,
  resetVerificationStore,
  selectIDVState,
  selectLoading,
  setLoading,
  startIDVerification,
  VerificationStatus
} from './verificationSlice';

// Constants
const DEFAULT_THEME = 'dark';
const EMBEDDED_FLOW_POLLING_INTERVAL = 200; // .2 seconds
const EMBEDDED_FLOW_POLLING_TIMEOUT = 30000; // 30 seconds
const POLLING_INTERVAL = 10000; // 10 seconds
const POLLING_TIMEOUT = 1800000; // 30 minutes
const FAERecourse = 'AgeEstimation';
const FEATURE_ACCESS_POLLING_INTERVAL = 1000; // 1 seconds
const FEATURE_ACCESS_POLLING_TIMEOUT = 10000; // 10 seconds

function FAEPersonaFlow({
  translate,
  onHidecallback,
  ageEstimation,
  featureSpecificParams
}: {
  translate: TranslateFunction;
  onHidecallback: () => void;
  ageEstimation: boolean;
  featureSpecificParams: TFeatureSpecificData;
}): React.ReactElement {
  // ===============================
  // Redux State & Dispatch
  // ===============================
  const dispatch = useAppDispatch();
  const IDVState = useSelector(selectIDVState);
  const loading = useSelector(selectLoading);
  const featureName = useSelector(selectFeatureName);
  const namespace = useSelector(selectNamespace);
  const ampFeatureCheckData = useSelector(selectAmpFeatureCheckData);
  const featureAccess = useSelector(selectFeatureAccess);
  const { vendorVerificationData, status: FAEStatus, error: verificationError } = IDVState;
  const { context = 'defaultContext' } = featureSpecificParams || {};

  // ===============================
  // Refs & Derived State
  // ===============================
  const embeddedFlowPollingRef = useRef(false); // For embedded flow boolean flag
  const hostedFlowIntervalRef = useRef<NodeJS.Timeout | null>(null); // For hosted flow interval ID
  const hostedFlowTimeoutRef = useRef<NodeJS.Timeout | null>(null); // For hosted flow timeout ID
  const featureAccessIntervalRef = useRef<NodeJS.Timeout | null>(null); // Feature access polling interval
  const featureAccessEndTimeRef = useRef<number>(0);
  const featureAccessPollingStartedRef = useRef(false);
  const endTime = useRef(Number(new Date()) + POLLING_TIMEOUT);
  const FAEStatusRef = useRef(FAEStatus);
  FAEStatusRef.current = FAEStatus; // Update ref to avoid stale closure
  const featureAccessRef = useRef(featureAccess);
  featureAccessRef.current = featureAccess;
  const personaClientRef = useRef<typeof Persona.Client.prototype | null>(null);
  const { sessionIdentifier, verificationLink } = vendorVerificationData;
  const theme = useTheme();
  const isWebview = (DeviceMeta && DeviceMeta().isInApp) ?? false;
  const flowType = isWebview ? FlowType.Hosted : FlowType.Embedded;

  // ===============================
  // Helper functions
  // ===============================

  // Clear hosted flow polling interval (used in multiple places)
  const clearHostedPolling = () => {
    if (hostedFlowIntervalRef.current) {
      clearInterval(hostedFlowIntervalRef.current);
      hostedFlowIntervalRef.current = null;
    }
  };

  // Clear feature access polling interval
  const clearFeatureAccessPolling = () => {
    if (featureAccessIntervalRef.current) {
      clearInterval(featureAccessIntervalRef.current);
      featureAccessIntervalRef.current = null;
    }
  };

  // Check if status is terminal (for embedded flow)
  function checkIsTerminalStatus(status: VerificationStatus | null) {
    if (!status) return false;
    return (
      status.sessionStatus === VerificationStatusCode.Stored ||
      status.sessionStatus === VerificationStatusCode.RequiresRetry ||
      status.sessionStatus === VerificationStatusCode.Failure
    );
  }

  // Handle terminal status and cleanup
  function terminationCleanup() {
    clearHostedPolling();
    clearFeatureAccessPolling();
    dispatch(resetVerificationStore());
    clearTimeout(hostedFlowTimeoutRef.current);
  }
  // Hide the modal and cleanup
  function onHide() {
    terminationCleanup();
    onHidecallback();
  }
  // Handle terminal status and cleanup
  function handleTerminalStatus() {
    if (featureAccessPollingStartedRef.current) return;
    featureAccessPollingStartedRef.current = true;
    featureAccessEndTimeRef.current = Number(new Date()) + FEATURE_ACCESS_POLLING_TIMEOUT;
    dispatch(setLoading(true));

    sendFAEMessageShownEvent(
      context,
      sessionIdentifier,
      FAEEventConstants.field.webFaeStatus,
      VerificationStatusCode[FAEStatus.sessionStatus]
    );

    const doFetch = () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      dispatch(
        fetchFeatureAccess({
          featureName,
          ampFeatureCheckData,
          namespace,
          successfulAction: FAERecourse
        })
      );
    };

    // Initial fetch immediately
    doFetch();

    // Start polling until access is no longer actionable or timeout
    const intervalId = setInterval(() => {
      const { current } = featureAccessRef;
      const isActionable = current?.data?.access === Access.Actionable;
      const faeInRecourse = current?.data?.recourses?.find(
        recourse => recourse.action === FAERecourse
      );

      const timedOut = Number(new Date()) >= featureAccessEndTimeRef.current;
      if (!faeInRecourse) {
        clearInterval(intervalId);
        featureAccessIntervalRef.current = null;
        dispatch(setLoading(false));
        terminationCleanup();
      } else if (!isActionable || timedOut) {
        clearInterval(intervalId);
        featureAccessIntervalRef.current = null;
        dispatch(setLoading(false));
        onHide();
      } else {
        doFetch();
      }
    }, FEATURE_ACCESS_POLLING_INTERVAL);

    featureAccessIntervalRef.current = intervalId;
  }

  // Initialize FAE flow by calling Roblox age verification API
  function initializeFAE() {
    dispatch(setLoading(true));
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    dispatch(startIDVerification(ageEstimation));
    if (flowType === FlowType.Embedded) {
      Persona.Client.preload().catch(error => {
        console.error('Failed to preload Persona client:', error);
      });
    }
    if (flowType === FlowType.Hosted) {
      endTime.current = Number(new Date()) + POLLING_TIMEOUT;
    }
  }

  // start FAE hosted flow
  function startFAEHostedFlow() {
    const intervalId = setInterval(() => {
      if (Number(new Date()) < endTime.current) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        dispatch(fetchIDVerificationStatus(vendorVerificationData.sessionIdentifier));
      } else {
        clearInterval(intervalId);
        onHidecallback(); // Notify parent that verification timed out
      }
    }, POLLING_INTERVAL);
    // Store interval ID for cleanup
    hostedFlowIntervalRef.current = intervalId;

    if (vendorVerificationData.verificationLink) {
      sendFAEPageLoadEvent(context, sessionIdentifier, FAEEventConstants.field.webHostedFaeStart);
      openVerificationLink(vendorVerificationData.verificationLink, theme || DEFAULT_THEME);
    }
  }

  // start FAE embedded flow
  function startFAEEmbeddedFlow() {
    // Get user locale for Persona
    const userLocale = new Intl().getLocale();

    personaClientRef.current = new Persona.Client({
      inquiryId: sessionIdentifier,
      styleVariant: theme || DEFAULT_THEME,
      ...(userLocale && { language: userLocale }),
      onReady: () => {
        personaClientRef.current?.open();
        // report FAE modal open event with session identifier
        sendFAEModalShownEvent(
          context,
          sessionIdentifier,
          FAEEventConstants.field.webEmbededFaeStart
        );
        dispatch(setLoading(false));
      },
      onComplete: ({ inquiryId, status, fields }) => {
        if (embeddedFlowPollingRef.current) return; // prevent multiple polling loops
        dispatch(setLoading(true));
        embeddedFlowPollingRef.current = true;
        const intervalId = setInterval(() => {
          // Use ref to get current status since it cannot be accessed directly in closure.
          const { current: currentStatus } = FAEStatusRef;
          const isTerminal = checkIsTerminalStatus(currentStatus);

          if (!isTerminal) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            dispatch(fetchIDVerificationStatus(sessionIdentifier));
          } else {
            clearInterval(intervalId);
          }
        }, EMBEDDED_FLOW_POLLING_INTERVAL);

        hostedFlowTimeoutRef.current = setTimeout(() => {
          clearInterval(intervalId);
          dispatch(resetVerificationStore());
          onHide(); // Timeout = Denied access
        }, EMBEDDED_FLOW_POLLING_TIMEOUT);
      },
      onCancel: ({ inquiryId, sessionToken }) => {
        // report cancel
        sendFAEButtonClickEvent(
          context,
          inquiryId,
          FAEEventConstants.btn.cancelFae,
          FAEEventConstants.field.webEmbededFaeCancel
        );
        onHide();
      },
      onError: error => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        dispatch(fetchIDVerificationStatus(vendorVerificationData.sessionIdentifier));
        sendFAEFormInteractionEvent(
          context,
          sessionIdentifier,
          FAEEventConstants.field.webEmbededFaeError
        );
        console.error(error);
      }
    });
  }

  // ===========================================
  // Effects to control 3 stages of the FAE flow
  // ===========================================

  // Stage 1: initialize FAE flow calling Roblox age verification api
  useEffect(() => {
    initializeFAE();
    // Cleanup on component unmount
    return () => {
      terminationCleanup();
      clearHostedPolling();
      if (personaClientRef.current) {
        personaClientRef.current.destroy();
        personaClientRef.current = null;
      }
    };
  }, []);

  // Stage 2: start vendor flow after receiving session identifier.
  // and start polling for FAE status from Roblox age verification api.
  useEffect(() => {
    if (flowType === FlowType.Embedded && sessionIdentifier) {
      startFAEEmbeddedFlow();
    } else if (flowType === FlowType.Hosted && sessionIdentifier && verificationLink != null) {
      startFAEHostedFlow();
    }
  }, [sessionIdentifier, verificationLink]);

  // Stage 3: handle terminal status when fail or success
  useEffect(() => {
    if (checkIsTerminalStatus(FAEStatus)) {
      handleTerminalStatus();
    }
  }, [FAEStatus]);

  // Close loading modal as soon as access is no longer actionable
  useEffect(() => {
    if (!featureAccessPollingStartedRef.current) return;
    if (featureAccess?.loading) return;
    const latestAccess = featureAccess?.data?.access;
    if (featureAccessIntervalRef.current && latestAccess && latestAccess !== Access.Actionable) {
      clearFeatureAccessPolling();
      dispatch(setLoading(false));
      onHide();
    }
  }, [featureAccess]);

  // ===============================
  // Component Render
  // ===============================

  // Get FAE component (only shows loading, no success/error pages)
  function getFAEComponent() {
    // Show error page if verification failed to start (only when not loading)
    if (verificationError && !loading) {
      return <VerificationCompletePage translate={translate} onHide={onHide} />;
    }

    if (loading) {
      return <LoadingPage />;
    }
    return null;
  }

  // FAE page will only show loading page. No success or error page.
  return <React.Fragment>{getFAEComponent()}</React.Fragment>;
}

function FAEContainer({
  translate,
  onHidecallback,
  ageEstimation,
  featureSpecificParams
}: {
  translate: TranslateFunction;
  onHidecallback: () => void;
  ageEstimation: boolean;
  featureSpecificParams: TFeatureSpecificData;
}): React.ReactElement {
  const isWebview = (DeviceMeta && DeviceMeta().isInApp) ?? false;
  const ixpValues = useExperiments(faeQrCodeExperimentLayer);
  const isExperimentLoaded = ixpValues !== null;
  const isFaeQrCodeEnabled = Boolean(ixpValues?.isFaeQrCodeEnabled);
  const isFromAccountInfo = featureSpecificParams?.source === 'accountInfo';

  const showQrCodeFlow = !isWebview && isFaeQrCodeEnabled && isFromAccountInfo;

  useEffect(() => {
    if (isExperimentLoaded && ExperimentationService?.logLayerExposure) {
      ExperimentationService.logLayerExposure(faeQrCodeExperimentLayer);
    }
  }, [isExperimentLoaded]);

  if (!isExperimentLoaded) {
    return <LoadingPage />;
  }

  if (showQrCodeFlow) {
    return (
      <FAEQRCodeContainer
        translate={translate}
        onHidecallback={onHidecallback}
        featureSpecificParams={featureSpecificParams}
      />
    );
  }

  return (
    <FAEPersonaFlow
      translate={translate}
      onHidecallback={onHidecallback}
      ageEstimation={ageEstimation}
      featureSpecificParams={featureSpecificParams}
    />
  );
}

export default FAEContainer;
