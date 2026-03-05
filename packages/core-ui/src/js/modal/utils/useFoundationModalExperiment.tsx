import { isTestSite } from "@rbx/core-scripts/meta/environment";

/**
 * Hook to read the global experiment flag for Foundation modal mode.
 */
export function useFoundationModalExperiment(): { useFoundation: boolean } {
  // TODO: Setup IXP experiment.  Currently, IXP does not work here yet as
  // ExperimentationService is not yet loaded by the time reactStyleGuide loads.
  return { useFoundation: isTestSite() };
}
