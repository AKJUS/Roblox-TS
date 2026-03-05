import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import { EventContext, EVENT_NAME, EVENT_PLATFORM } from "./eventConstants";

const sendReminderOfNormsEvent = (
  interventionId: string,
  interactionType: string,
  reminderNumber: number,
  userId: number,
  timestamp: number,
  timeToInteraction: number,
  experimentVariant: string,
): void => {
  sendEventWithTarget(
    EVENT_NAME,
    EventContext,
    // additionalProperties
    {
      user_id: userId,
      source_intervention_id: interventionId,
      reminder_number: reminderNumber,
      timestamp_milliseconds: timestamp,
      time_to_interact_seconds: timeToInteraction,
      interaction: interactionType,
      platform: EVENT_PLATFORM,
      experiment_variant: experimentVariant,
    },
    targetTypes.WWW,
  );
};

export default sendReminderOfNormsEvent;
