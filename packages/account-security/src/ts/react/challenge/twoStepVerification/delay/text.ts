// A tiny package standardizing text handlers for delayed actions.
import { useActiveMediaType } from "../hooks/useActiveMediaType";
import useTwoStepVerificationContext from "../hooks/useTwoStepVerificationContext";
import { DelayParameters } from "./types";

export type GetDelayTextProps = {
  delayParameters?: DelayParameters;
  dayTranslation: (numberOfDays: number) => string;
  hourTranslation: (numberOfHours: number) => string;
  minuteTranslation: (numberOfMinutes: number) => string;

  frictionType: string;

  erroneousDelayTranslation: string;
  noWaitTranslation: string;
}

export const getDelayTextFromDates = (
  {
    delayParameters,
    dayTranslation,
    hourTranslation,
    minuteTranslation,
    erroneousDelayTranslation,
    frictionType,
    noWaitTranslation
  }: GetDelayTextProps
): string | undefined => {
  // If there's no timestamp the action isn't delayed, no subtext necessary. This is the original
  // challenge case.
  if (!delayParameters?.delayUntil) {
    return undefined;
  }

  const { bypassableFrictionTypes } = delayParameters;
  // TODO: remove this once backend is fully in and decides which types we can bypass with.
  // Backwards compatibility while we test frontend before backend changes are in.
  const hardCodedFrictionTypesFallback = bypassableFrictionTypes ?? [
    'Passkey', 'SecurityKey', 'CrossDevice',
  ]
  // TODO: this will be challenge metadata
  // driven in the future, due to the phishable method predicates.
  // Only show delay text for applicable media types.
  if (hardCodedFrictionTypesFallback.includes(frictionType)) {
    return noWaitTranslation;
  }

  // Things that serialize to NaN. 
  if (Number.isNaN(Number(delayParameters.delayUntil))) {
    return erroneousDelayTranslation;
  }

  const nowUnixMillis = Date.now();
  // There is a conversion step between GCS and upwards that serializes longs as strings. Probably
  // out of fear of Javascript number representations reaching upper bounds.
  const delayUntilMillis = parseInt(delayParameters.delayUntil, 10);
  const differenceMillis = delayUntilMillis - nowUnixMillis
  const totalDiffMinutes = differenceMillis / 1000 / 60; // 60 seconds in a minute, 1000 milliseconds in a second.

  const dayDiff = Math.ceil(totalDiffMinutes / 1440); // 1440 minutes in a day.
  const hourDiff = Math.ceil(totalDiffMinutes / 60); // 60 minutes in an hour.
  const minuteDiff = Math.ceil(totalDiffMinutes); // Just minutes.

  if (totalDiffMinutes > 1440) {
    return dayTranslation(dayDiff);
  } else if (totalDiffMinutes > 60) {
    return hourTranslation(hourDiff);
  } else if (totalDiffMinutes > 0) {
    return minuteTranslation(minuteDiff);
  } else {
    return noWaitTranslation;
  }
}

// getDelayBodyTextFromDates is a convenience wrapper that returns the translated string by delay time
// if delay parameters are present. If the string would have been "No wait", it returns undefined
// instead to avoid being passed onto components that conditionally render the text based on its presence.
export const getDelayBodyTextFromDates = (
  props: GetDelayTextProps &
  // TODO: delete this flag.
  { isDelayedUiEnabled: boolean }): string | undefined => {
  const delayText = getDelayTextFromDates(props);
  if (!props.isDelayedUiEnabled || delayText === props.noWaitTranslation) {
    return undefined;
  }
  return delayText;
}

// A hook to consolidate some of the text.
export const useDelayedVerificationBodyText = (flag: boolean): string | undefined => {
  const { 
    state: {
      resources,
      delayParameters,
    } 
  } = useTwoStepVerificationContext();
  const activeMediaType = useActiveMediaType();

  return getDelayBodyTextFromDates({
    delayParameters,
    dayTranslation: resources.Label.DelayedVerification.WaitDays,
    hourTranslation: resources.Label.DelayedVerification.WaitHours,
    minuteTranslation: resources.Label.DelayedVerification.WaitMinutes,
    erroneousDelayTranslation: resources.Label.UnableToCalculateDelay,
    frictionType: activeMediaType ?? '', 
    noWaitTranslation: resources.Label.NoWait,
    // This can technically be fetched from the hook but doing so makes unit testing much harder,
    // as reducers to set the metadata are internal to the context provider.
    isDelayedUiEnabled: flag,
  });
};
