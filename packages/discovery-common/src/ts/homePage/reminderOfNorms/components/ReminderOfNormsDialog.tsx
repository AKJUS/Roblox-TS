import React, { useEffect, useState, useRef } from "react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { useTranslation } from "@rbx/core-scripts/react";
import { Modal, Button } from "@rbx/core-ui";
import { useReminderOfNormsContext } from "../hooks/ReminderOfNormsProvider";
import getDisplayStringsFromReminderData from "../utils/getDisplayStringsFromReminderData";
import sendReminderOfNormsEvent from "../services/sendReminderOfNormsEvent";
import { EventTypes } from "../services/eventConstants";

const ReminderOfNormsDialog = (): JSX.Element | null => {
  const [isDialogSeen, setIsDialogSeen] = useState<boolean>(false);
  const reminderData = useReminderOfNormsContext();
  const pageLoadTimestamp = useRef<number>(0);
  const userId = authenticatedUser()?.id!;

  useEffect(() => {
    pageLoadTimestamp.current = Date.now();
  }, []);

  const { translate } = useTranslation();

  if (
    reminderData == null ||
    !reminderData?.shouldSurfaceReminder ||
    !reminderData?.policyViolation
  ) {
    return null;
  }

  const { interventionId } = reminderData;

  const isShowDialog = !isDialogSeen && reminderData?.shouldSurfaceReminder;

  const { dialogTitle, dialogBodyAbuseType, dialogBodyGuidelineReminder, confirmationButtonLabel } =
    getDisplayStringsFromReminderData(reminderData, translate);

  return (
    <Modal
      className="reminder-of-norms-dialog-modal"
      show={isShowDialog}
      onHide={() => {
        const currentTimestamp = Date.now();
        sendReminderOfNormsEvent(
          interventionId,
          EventTypes.DISMISSED,
          reminderData.reminderNumber,
          userId,
          currentTimestamp,
          (currentTimestamp - pageLoadTimestamp.current) / 1000,
          reminderData.experimentVariant,
        );
        setIsDialogSeen(true);
      }}
    >
      <Modal.Header
        className="reminder-of-norms-dialog-title"
        title={dialogTitle}
        showCloseButton={false}
      />
      <Modal.Body className="reminder-of-norms-dialog-body">
        <p className="dialog-body-abuse-type">{dialogBodyAbuseType}</p>
        <p className="dialog-body-guideline-reminder">{dialogBodyGuidelineReminder}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="reminder-of-norms-confirm-button"
          onClick={() => {
            const currentTimestamp = Date.now();
            sendReminderOfNormsEvent(
              interventionId,
              EventTypes.CTA_CLICKED,
              reminderData.reminderNumber,
              userId,
              currentTimestamp,
              (currentTimestamp - pageLoadTimestamp.current) / 1000,
              reminderData.experimentVariant,
            );
            setIsDialogSeen(true);
          }}
        >
          {confirmationButtonLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReminderOfNormsDialog;
