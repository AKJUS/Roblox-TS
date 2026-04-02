import { useMemo } from "react";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import useExperimentValues from "./useExperimentValues";

const useIsHigherResolutionWideThumbnailEnabled = <T extends Record<string, unknown>>(
  layerName: string,
  defaultValues: T,
  flagKey: keyof T,
): {
  isHigherResolutionWideThumbnailEnabled: boolean;
  isIxpLoading: boolean;
} => {
  const { ixpData, isLoading } = useExperimentValues(layerName, defaultValues);

  const isDesktop = useMemo(() => getDeviceMeta()?.isDesktop ?? false, []);

  return {
    // we only show the higher resolution for desktop, as the performance cost of
    // loading a larger thumbnail on mobile isn't worth it since mobile screens are smaller
    isHigherResolutionWideThumbnailEnabled: isDesktop && !!ixpData[flagKey],
    // if not desktop, we don't need to wait for the IXP data
    isIxpLoading: isDesktop && isLoading,
  };
};

export default useIsHigherResolutionWideThumbnailEnabled;
