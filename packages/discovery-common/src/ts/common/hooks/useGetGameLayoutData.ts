import { useMemo } from "react";
import { TGameData, TLayoutMetadata } from "../types/bedev1Types";

export const getGameLayoutData = (
  gameData: TGameData,
  topicId?: string,
): TLayoutMetadata | undefined => {
  if (gameData.layoutDataBySort && topicId !== undefined && gameData.layoutDataBySort[topicId]) {
    return gameData.layoutDataBySort[topicId];
  }

  return gameData.defaultLayoutData;
};

const useGetGameLayoutData = (
  gameData: TGameData,
  topicId?: string,
): TLayoutMetadata | undefined => {
  return useMemo(() => {
    return getGameLayoutData(gameData, topicId);
  }, [gameData, topicId]);
};

export default useGetGameLayoutData;
