import React, { useEffect, useState } from 'react';
// TODO: we should replace once foundation-ui loading component is ready.
import { CircularProgress } from '@material-ui/core';

import { useSelector } from 'react-redux';
import { Button, Dialog, DialogContent, DialogBody, DialogFooter, Icon } from '@rbx/foundation-ui';
import { useAppDispatch } from './store';

import useBiometricContext from '../../hooks/useBiometricContext';
import { BiometricActionType } from '../../store/action';
import {
  selectVerificationStatus,
  setVerificationStatus,
  VerificationStatusType
} from './verificationSlice';

type PersonaLivenessHostedModalProps = {
  startPolling: () => void;
  verificationLink: string;
};

const PersonaLivenessHostedModal: React.FC<PersonaLivenessHostedModalProps> = ({
  startPolling,
  verificationLink
}: PersonaLivenessHostedModalProps) => {
  const dispatch = useAppDispatch();

  const {
    state: { eventService, metricsService, resources, onChallengeDisplayed },
    dispatch: biometricDispatch
  } = useBiometricContext();
  const livenessResources = resources.personaLiveness;

  const verificationStatus = useSelector(selectVerificationStatus);
  const loading = verificationStatus.status === VerificationStatusType.Polling;
  const open =
    verificationStatus.status === VerificationStatusType.Challenge ||
    verificationStatus.status === VerificationStatusType.Polling;
  // Canceled state is used to prevent the modal from being re-rendered upon reinitialization of
  // challenge due to poor cleanup of old containers. This becomes an issue due to global redux
  // store that can set status back to challenge or polling.
  const [canceled, setCanceled] = useState(false);

  useEffect(() => {
    onChallengeDisplayed({ displayed: true });
  }, []);

  const handleContinue = () => {
    dispatch(setVerificationStatus({ status: VerificationStatusType.Polling }));
    startPolling();
  };

  const handleCancel = () => {
    dispatch(setVerificationStatus({ status: VerificationStatusType.Cancelled }));
    setCanceled(true);

    // Abandon the biometric challenge
    biometricDispatch({
      type: BiometricActionType.SET_CHALLENGE_ABANDONED
    });
  };

  const titleComponents = loading ? (
    <React.Fragment />
  ) : (
    <span className='text-heading-medium'>{livenessResources.title}</span>
  );

  const bodyComponents = loading ? (
    <React.Fragment>
      <span className='text-center'>
        <CircularProgress />
      </span>
      <p className='text-center'>{livenessResources.loading}</p>
    </React.Fragment>
  ) : (
    <p>{livenessResources.content}</p>
  );

  const footerComponents = (
    <DialogFooter className='gap-x-medium flex'>
      <Button
        as='div'
        aria-label={livenessResources.cancelButton}
        onClick={handleCancel}
        variant='Standard'
        size='Medium'
        className='grow basis-0'>
        {livenessResources.cancelButton}
      </Button>
      {!loading && (
        <Button
          as='a'
          href={verificationLink}
          target='_blank'
          rel='noopener noreferrer'
          aria-label={livenessResources.continueButton}
          onClick={handleContinue}
          variant='Emphasis'
          size='Medium'
          className='grow basis-0'>
          <span className='flex'>
            <Icon name='icon-regular-arrow-up-right-from-square' size='Medium' />
            <span className='padding-y-xsmall padding-x-small text-truncate-end text-no-wrap'>
              {livenessResources.continueButton}
            </span>
          </span>
        </Button>
      )}
    </DialogFooter>
  );

  return (
    <Dialog
      open={open && !canceled}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onOpenChange={() => {}}
      isModal
      size='Medium'
      type='Default'
      ariaLabel={livenessResources.title}
      hasCloseAffordance={false}>
      {titleComponents}
      <DialogContent>
        <DialogBody className='gap-large flex flex-col'>
          {titleComponents}
          {bodyComponents}
        </DialogBody>
        {footerComponents}
      </DialogContent>
    </Dialog>
  );
};

export default PersonaLivenessHostedModal;
