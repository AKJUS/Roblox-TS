import { useEffect, useState } from 'react';
import playButtonService from '../services/playButtonService';
import { PlayabilityStatus } from '../constants/playButtonConstants';
import { TPlayabilityStatus } from '../types/playButtonTypes';

export const usePlayabilityStatus = (
  universeId: string
): [
  TPlayabilityStatus | undefined,
  () => Promise<void>,
  string | undefined,
  boolean | undefined, // isPlayable
  boolean // isLoadingPlayability
] => {
  const [playabilityStatus, setPlayabilityStatus] = useState<TPlayabilityStatus | undefined>(
    undefined
  );
  const [unplayableDisplayText, setUnplayableDisplayText] = useState<string | undefined>(undefined);
  const [isPlayable, setIsPlayable] = useState<boolean | undefined>(undefined);
  const [isLoadingPlayability, setIsLoadingPlayability] = useState<boolean>(false);

  const fetchPlayabilityStatus = async () => {
    setIsLoadingPlayability(true);
    setPlayabilityStatus(undefined);
    setUnplayableDisplayText(undefined);
    try {
      const response = await playButtonService.getPlayabilityStatus([universeId]);
      setPlayabilityStatus(response?.playabilityStatus);
      setUnplayableDisplayText(response?.unplayableDisplayText);
      setIsPlayable(response?.isPlayable);
    } catch {
      setPlayabilityStatus(PlayabilityStatus.TemporarilyUnavailable);
      setUnplayableDisplayText(undefined);
      setIsPlayable(undefined);
    } finally {
      setIsLoadingPlayability(false);
    }
  };

  useEffect(
    () => {
      // eslint-disable-next-line no-void
      void fetchPlayabilityStatus();

      const onPageShow = (event: PageTransitionEvent) => {
        if (event.persisted) {
          // loaded from bf-cache, so need to refetch playability
          // eslint-disable-next-line no-void
          void fetchPlayabilityStatus();
        }
      };

      window.addEventListener('pageshow', onPageShow);

      return () => {
        window.removeEventListener('pageshow', onPageShow);
      };
    },
    // TODO: fix me
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return [
    playabilityStatus,
    fetchPlayabilityStatus,
    unplayableDisplayText,
    isPlayable,
    isLoadingPlayability
  ];
};

export default usePlayabilityStatus;
