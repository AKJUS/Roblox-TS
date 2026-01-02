import { TranslateFunction, withTranslations } from '@rbx/core-scripts/legacy/react-utilities';
import { translations } from '../../../../component.json';
import playButtonConstants, { PlayabilityStatus } from '../constants/playButtonConstants';
import { TPlayabilityStatusWithUnplayableError } from '../types/playButtonTypes';

const { playButtonErrorStatusTranslationMap } = playButtonConstants;

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
}) => (
  <span data-testid='play-error' className={errorClassName}>
    {unplayableDisplayText == null || unplayableDisplayText === ''
      ? translate(
          playButtonErrorStatusTranslationMap[playabilityStatus]
            ? playButtonErrorStatusTranslationMap[playabilityStatus]
            : playButtonErrorStatusTranslationMap[PlayabilityStatus.UnplayableOtherReason]
        )
      : unplayableDisplayText}
  </span>
);

export default withTranslations<TErrorProps>(Error, translations);
