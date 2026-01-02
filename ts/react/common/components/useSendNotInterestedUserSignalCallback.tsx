import { useCallback } from 'react';
import { TranslateFunction } from 'react-utilities';
import { fireEvent } from 'roblox-event-tracker';
import { useSystemFeedback } from 'react-style-guide';
import bedev2Services from '../services/bedev2Services';
import {
  TUserSignalEntity,
  TUserSignalAssetType,
  TUserSignalValueType,
  TUserSignalType
} from '../types/userSignalTypes';
import { PageContext } from '../types/pageContext';
import { userSignal } from '../constants/configConstants';
import { FeaturePlacesList } from '../constants/translationConstants';
import { getProductSurface } from './userSignalUtils';

// send a NotInterested user signal with true for not interested or false for undoing a not interested
const useSendNotInterestedUserSignalCallback = (
  universeId: number,
  translate: TranslateFunction,
  page?: PageContext,
  topicId?: string,
  toggleIsHidden?: () => void
): ((isNotInterested: boolean) => void) => {
  const { systemFeedbackService } = useSystemFeedback();

  const onSignalFailure = useCallback(() => {
    // revert the hidden state if signal fails
    if (toggleIsHidden) {
      toggleIsHidden();
    } else {
      fireEvent(userSignal.ExplicitFeedbackSignalStateRevertFailedDueToMissingToggle);
    }
    systemFeedbackService.warning(translate(FeaturePlacesList.NetworkError));
  }, [toggleIsHidden, systemFeedbackService, translate]);

  return useCallback(
    (isNotInterested: boolean) => {
      const productSurface = getProductSurface(page);
      if (!productSurface) {
        onSignalFailure();
        return;
      }

      if (!topicId) {
        onSignalFailure();
        fireEvent(userSignal.ExplicitFeedbackMissingTopicIdCounterEvent);
        return;
      }

      const signalEntity: TUserSignalEntity = {
        id: universeId.toString(),
        assetType: TUserSignalAssetType.Game,
        signalOrigin: {
          productSurface,
          topicId,
          subIds: [topicId]
        }
      };

      bedev2Services
        .postUserSignal(
          { boolValue: isNotInterested },
          TUserSignalValueType.Bool,
          signalEntity,
          TUserSignalType.NotInterested
        )
        .catch(() => {
          onSignalFailure();
          fireEvent(userSignal.ExplicitFeedbackUserSignalFailedCounterEvent);
        });
    },
    [universeId, page, topicId, onSignalFailure]
  );
};

export default useSendNotInterestedUserSignalCallback;
