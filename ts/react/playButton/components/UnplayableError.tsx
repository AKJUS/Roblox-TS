import React from 'react';
import { TranslateFunction, withTranslations } from 'react-utilities';
import playButtonTranslationConfig from '../../../../translation.config';
import playButtonConstants from '../constants/playButtonConstants';
import { TPlayabilityStatusWithUnplayableError } from '../types/playButtonTypes';

const { playButtonErrorStatusTranslationMap, PlayabilityStatus } = playButtonConstants;

export type TErrorProps = {
  playabilityStatus: TPlayabilityStatusWithUnplayableError;
  unplayableDisplayText?: string;
  errorClassName?: string;
};

export const Error = ({
  translate,
  playabilityStatus,
  unplayableDisplayText,
  errorClassName = 'error-message'
}: TErrorProps & {
  translate: TranslateFunction;
}): JSX.Element => (
  <span data-testid='play-error' className={errorClassName}>
    {unplayableDisplayText ||
      translate(
        playButtonErrorStatusTranslationMap[playabilityStatus]
          ? playButtonErrorStatusTranslationMap[playabilityStatus]
          : playButtonErrorStatusTranslationMap[PlayabilityStatus.UnplayableOtherReason]
      )}
  </span>
);

export default withTranslations<TErrorProps>(Error, playButtonTranslationConfig);
