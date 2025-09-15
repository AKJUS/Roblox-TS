import React from 'react';
import { Provider } from 'react-redux';
import useBiometricContext from '../hooks/useBiometricContext';
import PersonaLivenessCheck from './personaLiveness/personaLivenessV1';
import { BiometricActionType } from '../store/action';
import { store } from './personaLiveness/store';

/**
 * This is the entry point for the biometric challenge.
 * It renders the appropriate container based on the biometric type.
 */
const BiometricV1: React.FC = () => {
  const {
    state: {
      biometricType,
      renderInline,
      resources,
      metricsService,
      eventService,
      onChallengeDisplayed
    },
    dispatch
  } = useBiometricContext();

  switch (biometricType) {
    case 'personaliveness':
      return (
        <Provider store={store}>
          <PersonaLivenessCheck onChallengeDisplayed={onChallengeDisplayed} />
        </Provider>
      );
    default:
      console.error('Biometric type not supported:', biometricType);
      break;
  }

  return null;
};

export default BiometricV1;
