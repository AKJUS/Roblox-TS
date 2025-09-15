import React, {
  createContext,
  ReactChild,
  ReactElement,
  useState,
  useReducer,
  useEffect
} from 'react';
import { TranslateFunction } from 'react-utilities';
import { BiometricAction } from './action';
import { BiometricState } from './state';
import {
  OnChallengeCompletedCallback,
  OnChallengeDisplayedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback
} from '../interface';
import { getResources } from '../constants/resources';
import { EventService } from '../services/eventService';
import { MetricsService } from '../services/metricsService';
import biometricStateReducer from './stateReducer';

export type BiometricContext = {
  state: BiometricState;
  dispatch: React.Dispatch<BiometricAction>;
};

export const BiometricContext = createContext<BiometricContext | null>(null);

type Props = {
  challengeId: string;
  biometricType: string;
  appType?: string;
  renderInline: boolean;
  eventService: EventService;
  metricsService: MetricsService;
  translate: TranslateFunction;
  onChallengeDisplayed: OnChallengeDisplayedCallback;
  onChallengeCompleted: OnChallengeCompletedCallback;
  onChallengeInvalidated: OnChallengeInvalidatedCallback;
  onModalChallengeAbandoned: OnModalChallengeAbandonedCallback | null;
  children: ReactChild;
};

/**
 * A React provider is a special component that wraps a tree of components and
 * exposes some global state (context) to the entire tree. Descendants can then
 * access this context with `useContext`.
 */

export const BiometricContextProvider = ({
  challengeId,
  biometricType,
  appType,
  renderInline,
  eventService,
  metricsService,
  translate,
  onChallengeDisplayed,
  onChallengeCompleted,
  onChallengeInvalidated,
  onModalChallengeAbandoned,
  children
}: Props): ReactElement => {
  // We declare these variables as lazy-initialized state variables since they
  // do not need to be re-computed if this component re-renders.
  const [resources] = useState(() => getResources(translate));
  const [initialState] = useState<BiometricState>(() => ({
    // Immutable parameters
    challengeId,
    biometricType,
    appType,
    renderInline,
    // Immutable state
    resources,
    eventService,
    metricsService,
    onChallengeDisplayed,
    onModalChallengeAbandoned,
    // Mutable state
    onChallengeCompletedData: null,
    onChallengeInvalidatedData: null,
    isModalVisible: false
  }));

  // Components will access and mutate state via these variables:
  const [state, dispatch] = useReducer(biometricStateReducer, initialState);

  // Effects
  useEffect(() => {
    // Ensure that invalidation effect has not already fired.
    if (state.onChallengeCompletedData === null || state.onChallengeInvalidatedData !== null) {
      return;
    }

    onChallengeCompleted(state.onChallengeCompletedData);
  }, [state.onChallengeCompletedData, state.onChallengeInvalidatedData, onChallengeCompleted]);

  useEffect(() => {
    // Ensure that completion effect has not already fired.
    if (state.onChallengeCompletedData !== null || state.onChallengeInvalidatedData === null) {
      return;
    }

    // eventService.sendChallengeInvalidatedEvent();
    // metricsService.fireChallengeInvalidatedEvent();
    onChallengeInvalidated(state.onChallengeInvalidatedData);
  }, [
    eventService,
    metricsService,
    state.onChallengeCompletedData,
    state.onChallengeInvalidatedData,
    onChallengeInvalidated
  ]);

  return (
    <BiometricContext.Provider value={{ state, dispatch }}>{children}</BiometricContext.Provider>
  );
};
