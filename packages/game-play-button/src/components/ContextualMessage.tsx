import { TranslateFunction, withTranslations } from "@rbx/core-scripts/legacy/react-utilities";
import { translations } from "../constants/translations";
import { PlayabilityStatus, FeatureExperienceDetails } from "../constants/playButtonConstants";
import { TPlayabilityStatus } from "../types/playButtonTypes";
import UnplayableError from "./UnplayableError";
import { shouldShowUnplayableButton } from "../utils/playButtonUtils";

export type TContextualMessageProps = {
  playabilityStatus: TPlayabilityStatus | undefined;
  shouldShowVpcPlayButtonUpsells: boolean | undefined;
  shouldShowNoticeAgreementIfPlayable?: boolean;
  unplayableDisplayText?: string;
  contextualMessageClassName?: string;
};

const ContextualMessage = ({
  translate,
  playabilityStatus,
  shouldShowVpcPlayButtonUpsells,
  unplayableDisplayText,
  shouldShowNoticeAgreementIfPlayable,
  contextualMessageClassName = "contextual-message",
}: TContextualMessageProps & {
  translate: TranslateFunction;
}) => {
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
      <span data-testid="play-contextual-message" className={contextualMessageClassName}>
        {translate(FeatureExperienceDetails.PlayButtonMessageAgreeToNotice)}
      </span>
    );
  }

  return null;
};

export default withTranslations<TContextualMessageProps>(ContextualMessage, translations);
