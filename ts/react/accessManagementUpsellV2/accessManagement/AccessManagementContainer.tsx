import React, { useEffect, useState } from 'react';
import { TranslateFunction } from 'react-utilities';
import { Modal } from 'react-style-guide';
import { useSelector } from 'react-redux';
import { TFeatureSpecificData } from 'Roblox';
import {
  resetAccessManagementStore,
  selectAccessManagement,
  selectCurrentStage,
  selectFeatureAccess,
  selectShowUpsell,
  selectVerificationStageRecourse,
  selectPrologueStatus,
  setRedirectLink,
  setStage,
  fetchFeatureAccess,
  setAmpFeatureCheckData,
  setPrologueUsed,
  setNamespace
} from './accessManagementSlice';
import { useAppDispatch } from '../store';
import { ModalEvent, AccessManagementUpsellEventParams } from './constants/viewConstants';
import EmailVerificationContainer from '../recourses/emailVerification/EmailVerificationContainer';
import IDVerificationContainer from '../recourses/IDVerification/IDVerificationContainer';
import FAEContainer from '../recourses/IDVerification/FAEContainer';
import { Access, UpsellStage, Recourse } from '../enums';
import Epilogue from './components/Epilogue';
import ParentalRequestContainer from '../recourses/parentalRequest/ParentalRequestContainer';
import Prologue from './components/Prologue';
import LoadingPage from './components/LoadingPage';
import useExperiments from '../hooks/useExperiments';
import vpcUpsellExperimentLayer from './constants/experimentConstants';
import ExpNewChildModal from '../enums/ExpNewChildModal';
import UpdateSettingsContainer from '../recourses/settings/UpdateSettingsContainer';
import UserSetting from '../../legallySensitiveContent/enums/UserSetting';
import VPCForFAETransformContainer from '../recourses/parentalRequest/VPCForFAETransformContainer';

function AccessManagementContainer({
  translate
}: {
  translate: TranslateFunction;
}): React.ReactElement {
  let displayContainer;
  const dispatch = useAppDispatch();
  const currentStage = useSelector(selectCurrentStage);
  const featureAccess = useSelector(selectFeatureAccess);
  const showUpsellModal = useSelector(selectShowUpsell);
  const isPrologueUsed = useSelector(selectPrologueStatus);
  const { loading } = useSelector(selectAccessManagement);
  const verificationStageRecourse = useSelector(selectVerificationStageRecourse);
  const [onHidecallback, setOnHideCallback] = useState<(access: Access) => string>(
    (access: Access) => access
  );
  const [recourseParameters, setRecourseParameters] = useState<Record<string, string> | null>({}); // Parameters passed by the caller of the AMP Upsell
  const [featureSpecificParams, setFeatureSpecificParams] = useState<TFeatureSpecificData | null>();

  const [asyncExit, setAsyncExit] = useState<boolean>(false);
  const [shouldSetStagePrologue, setshouldSetStagePrologue] = useState<boolean>(false);

  const expChildModalType =
    (useExperiments(vpcUpsellExperimentLayer)?.expNewChildModal as ExpNewChildModal) ??
    ExpNewChildModal.control;
  async function onAccessManagementCustomEvent(
    event: CustomEvent<AccessManagementUpsellEventParams>
  ) {
    const {
      featureName,
      redirectLink,
      ampFeatureCheckData,
      isAsyncCall,
      usePrologue: prologueAllowed,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ampRecourseData,
      featureSpecificData,
      closeCallback,
      namespace
    } = event.detail;
    setOnHideCallback(() => (access: Access): string => closeCallback(access));
    try {
      await dispatch(fetchFeatureAccess({ featureName, ampFeatureCheckData, namespace }));
    } catch (error) {
      // Handle error if needed
    }

    dispatch(setRedirectLink(redirectLink));

    setAsyncExit(isAsyncCall);

    if (ampFeatureCheckData) {
      dispatch(setAmpFeatureCheckData(ampFeatureCheckData));
    }
    if (namespace) {
      dispatch(setNamespace(namespace));
    }
    if (ampRecourseData) {
      setRecourseParameters(ampRecourseData);
    }

    if (featureSpecificData) {
      setFeatureSpecificParams(featureSpecificData);
    }

    // Only some experiment variants include a prologue (including control)
    const experimentVersionIncludesPrologue =
      expChildModalType === ExpNewChildModal.control ||
      expChildModalType === ExpNewChildModal.newPrologueNoVisual ||
      expChildModalType === ExpNewChildModal.newPrologueVisual;

    // Only show the prologue if we are both in a context that allows a prologue and the experiment variant includes a prologue
    const usePrologue = prologueAllowed && experimentVersionIncludesPrologue;
    if (usePrologue) {
      dispatch(setPrologueUsed(true));
      setshouldSetStagePrologue(true);
    } else {
      dispatch(setStage(UpsellStage.Verification));
    }
  }

  useEffect(() => {
    const handleEvent = onAccessManagementCustomEvent as EventListener;

    window.addEventListener(ModalEvent.StartAccessManagementUpsell, handleEvent);

    return () => window.removeEventListener(ModalEvent.StartAccessManagementUpsell, handleEvent);
  }, [expChildModalType]);

  useEffect(() => {
    const noopAccessState = [Access.Granted, Access.Denied];
    if (featureAccess?.loading) {
      return;
    }
    if (featureAccess?.data?.access && noopAccessState.includes(featureAccess.data.access)) {
      if (featureAccess?.data?.featureName !== 'CanCorrectAge') {
        onHidecallback(featureAccess.data.access);
      }
    }

    if (featureAccess?.data?.recourses?.length > 0 && shouldSetStagePrologue) {
      dispatch(setStage(UpsellStage.Prologue));
    }

    if (
      featureAccess?.data?.featureName === 'CanCorrectAge' &&
      featureAccess.data.access === Access.Denied &&
      (featureAccess?.data?.recourses === null || featureAccess?.data?.recourses?.length === 0)
    ) {
      // if child is not eligible for birthdate update due to VPC confirmed birthdate cap, dispatch to set upstage to epilogue
      dispatch(setStage(UpsellStage.Epilogue));
    } else if (
      featureAccess?.data?.featureName === 'CanCorrectAge' &&
      featureAccess?.data?.access === Access.Granted
    ) {
      // if child can correct birthdate, close the modal right away
      onHidecallback(featureAccess.data.access);
    }
  }, [featureAccess, shouldSetStagePrologue]);

  // Loop call FeatureCheck to check new access status
  function onHide() {
    onHidecallback(featureAccess.data.access);
    dispatch(resetAccessManagementStore());
  }

  // Close right away without calling featureCheck again
  function asyncOnHide() {
    dispatch(resetAccessManagementStore());
    // This is intentional as async flows (where we need to wait for additional user actions to complete) are always denied access
    onHidecallback(Access.Denied);
  }

  const onHideFunction = asyncExit ? asyncOnHide : onHide;

  function getVerificationContainer() {
    if (verificationStageRecourse) {
      switch (verificationStageRecourse.action) {
        case Recourse.AddedEmail:
          return <EmailVerificationContainer translate={translate} onHide={onHide} />;
        case Recourse.AgeEstimation:
          return (
            <FAEContainer
              translate={translate}
              onHidecallback={onHideFunction}
              featureSpecificParams={featureSpecificParams}
              ageEstimation
            />
          );
        case Recourse.GovernmentId:
          return (
            <IDVerificationContainer
              translate={translate}
              onHidecallback={onHideFunction}
              ageEstimation={false}
            />
          );
        case Recourse.ParentConsentRequest:
        case Recourse.ParentLinkRequest: {
          return (
            <ParentalRequestContainer
              recourse={verificationStageRecourse}
              translate={translate}
              onHidecallback={onHideFunction}
              value={recourseParameters}
              isPrologueUsed={isPrologueUsed}
              source={featureSpecificParams?.source}
            />
          );
        }
        case Recourse.UserSettings: {
          if (
            verificationStageRecourse.userSettings?.settingName ===
            UserSetting.allowFacialAgeEstimation
          ) {
            return (
              <VPCForFAETransformContainer
                translate={translate}
                onHidecallback={onHideFunction}
                value={recourseParameters}
                isPrologueUsed={isPrologueUsed}
                source={featureSpecificParams?.source}
              />
            );
          }
          return (
            <UpdateSettingsContainer
              translate={translate}
              recourse={verificationStageRecourse}
              updateSettingsModalProps={{
                onHide: () => {
                  onHideFunction();
                  featureSpecificParams.onHide?.();
                },
                ...featureSpecificParams
              }}
            />
          );
        }
        // TODO: ADD ERROR PAGE HERE
        default:
          return <Epilogue translate={translate} />;
      }
    }
    return <Epilogue translate={translate} />;
  }

  useEffect(() => {
    displayContainer = getVerificationContainer();
  }, [verificationStageRecourse]);

  if (loading) {
    displayContainer = <LoadingPage />;
  } else {
    switch (currentStage) {
      case UpsellStage.Prologue:
        if (featureAccess.data != null) {
          displayContainer = (
            <Prologue
              translate={translate}
              onHide={onHideFunction}
              recourseParameters={recourseParameters}
              expChildModalType={expChildModalType}
              featureSpecificParams={featureSpecificParams}
            />
          );
        }
        break;
      case UpsellStage.Verification:
        if (featureAccess.data != null) {
          displayContainer = getVerificationContainer();
        }
        break;
      case UpsellStage.Epilogue:
        displayContainer = <Epilogue translate={translate} onHide={onHideFunction} />;
        break;
      default:
        displayContainer = <LoadingPage />;
        break;
    }
  }

  return (
    <React.Fragment>
      <Modal
        backdrop='static'
        keyboard={false}
        show={showUpsellModal}
        onHide={onHide}
        size='sm'
        aria-labelledby='access-management-modal-title'
        className='access-management-upsell-modal'
        scrollable='true'
        centered='true'>
        {displayContainer}
      </Modal>
    </React.Fragment>
  );
}
export default AccessManagementContainer;
