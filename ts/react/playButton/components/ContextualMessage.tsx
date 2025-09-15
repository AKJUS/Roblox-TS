import React from 'react';
import { TranslateFunction, withTranslations } from 'react-utilities';
import playButtonTranslationConfig from '../../../../translation.config';
import playButtonConstants from '../constants/playButtonConstants';
import { TPlayabilityStatus } from '../types/playButtonTypes';
import UnplayableError from './UnplayableError';
import { shouldShowUnplayableButton } from '../utils/playButtonUtils';

const { PlayabilityStatus } = playButtonConstants;

export type TContextualMessageProps = {
  playabilityStatus: TPlayabilityStatus | undefined;
  shouldShowVpcPlayButtonUpsells: boolean | undefined;
  shouldShowNoticeAgreementIfPlayable?: boolean;
  unplayableDisplayText?: string;
  contextualMessageClassName?: string;
};

export const ContextualMessage = ({
  translate,
  playabilityStatus,
  shouldShowVpcPlayButtonUpsells,
  unplayableDisplayText,
  shouldShowNoticeAgreementIfPlayable,
  contextualMessageClassName = 'contextual-message'
}: TContextualMessageProps & {
  translate: TranslateFunction;
}): JSX.Element => {
  if (shouldShowUnplayableButton(playabilityStatus, shouldShowVpcPlayButtonUpsells)) {
    return (
      <UnplayableError
        playabilityStatus={playabilityStatus}
        unplayableDisplayText={unplayableDisplayText}
        errorClassName={contextualMessageClassName}
      />
    );
  }

  if (playabilityStatus === PlayabilityStatus.Playable && shouldShowNoticeAgreementIfPlayable) {
    return (
      <span data-testid='play-contextual-message' className={contextualMessageClassName}>
        {translate(playButtonConstants.FeatureExperienceDetails.PlayButtonMessageAgreeToNotice)}
      </span>
    );
  }

  return <React.Fragment />;
};

export default withTranslations<TContextualMessageProps>(
  ContextualMessage,
  playButtonTranslationConfig
);
