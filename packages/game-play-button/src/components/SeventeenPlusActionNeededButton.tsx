import React, { useCallback } from "react";
import {
  startAccessManagementUpsellFlow,
  sendUnlockPlayIntentEvent,
} from "../utils/playButtonUtils";
import ActionNeededButton from "./ActionNeededButton";
import playButtonConstants from "../constants/playButtonConstants";
import { PlayabilityStatus } from "../constants/playabilityStatus";

const { unlockPlayIntentConstants } = playButtonConstants;

type TSeventeenPlusActionNeededButtonProps = {
  universeId: string;
  hideButtonText?: boolean;
  buttonClassName?: string;
};

const SeventeenPlusActionNeededButton = ({
  universeId,
  hideButtonText,
  buttonClassName,
}: TSeventeenPlusActionNeededButtonProps): React.JSX.Element => {
  const onButtonClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      sendUnlockPlayIntentEvent(
        universeId,
        unlockPlayIntentConstants.unverifiedSeventeenPlusUpsellName,
        PlayabilityStatus.ContextualPlayabilityUnverifiedSeventeenPlusUser,
      );

      // result can be used for success/failure callback cases in the future
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const success = await startAccessManagementUpsellFlow();
    },
    [universeId],
  );

  return (
    <ActionNeededButton
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onButtonClick={onButtonClick}
      hideButtonText={hideButtonText}
      buttonClassName={buttonClassName}
    />
  );
};

SeventeenPlusActionNeededButton.defaultProps = {
  hideButtonText: undefined,
  buttonClassName: undefined,
};

export default SeventeenPlusActionNeededButton;
