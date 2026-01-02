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

const NotInterestedFeedbackFormId = {
  NotInterestedFeedback1: 'NotInterestedFeedback1'
};

const NotInterestedFeedbackFormTitleId = {
  WhyHideExperience: 'Why are you hiding this experience?'
};

// send a NotInterestedFeedback user signal that contains the answers from the not interested feedback form
const useSendNotInterestedFeedbackUserSignalCallback = (
  universeId: number,
  translate: TranslateFunction,
  toggleShowGiveFeedbackButton: () => void,
  page?: PageContext,
  topicId?: string
): ((selectedValues: { [key: string]: boolean }, text: string) => void) => {
  const { systemFeedbackService } = useSystemFeedback();

  const onSignalFailure = useCallback(() => {
    // revert the hidden state if signal fails
    toggleShowGiveFeedbackButton();
    systemFeedbackService.warning(translate(FeaturePlacesList.NetworkError));
  }, [toggleShowGiveFeedbackButton, systemFeedbackService, translate]);

  return useCallback(
    (selectedValues: { [key: string]: boolean }, text: string) => {
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

      const feedbackItems = [];
      for (const value of Object.keys(selectedValues)) {
        feedbackItems.push({
          id: value,
          selected: selectedValues[value] || false
        });
      }
      const feedbackResponse = {
        formId: NotInterestedFeedbackFormId.NotInterestedFeedback1,
        titleId: NotInterestedFeedbackFormTitleId.WhyHideExperience,
        textResponse: text,
        items: feedbackItems
      };

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
          { stringValue: JSON.stringify(feedbackResponse) },
          TUserSignalValueType.String,
          signalEntity,
          TUserSignalType.NotInterestedFeedback
        )
        .catch(() => {
          onSignalFailure();
          fireEvent(userSignal.ExplicitFeedbackUserSignalFailedCounterEvent);
        });
    },
    [universeId, page, topicId, onSignalFailure]
  );
};

export default useSendNotInterestedFeedbackUserSignalCallback;
