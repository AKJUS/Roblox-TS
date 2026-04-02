import experimentConstants from "../constants/experimentConstants";
import useIsHigherResolutionWideThumbnailEnabled from "./useIsHigherResolutionWideThumbnailEnabled";

const { layerNames, defaultValues } = experimentConstants;

const useIsHigherResolutionWideGameTileThumbnailEnabled = () =>
  useIsHigherResolutionWideThumbnailEnabled(
    layerNames.tileLayer,
    defaultValues.tileLayer,
    "IsHigherResolutionWideGameTileEnabled",
  );

export default useIsHigherResolutionWideGameTileThumbnailEnabled;
