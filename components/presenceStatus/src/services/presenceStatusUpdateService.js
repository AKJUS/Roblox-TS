import { EnvironmentUrls, RealTime } from "@rbx/core-scripts/legacy/Roblox";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import presenceStatusConstants from "../constants/presenceStatusConstants";

const presenceStatusUpdateService = (() => {
  const RTNPresenceTypeToString = ["Invalid", "Offline", "Online", "Studio", "Game"];
  const PresenceAPIPresenceTypeToString = ["Offline", "Online", "Game", "Studio", "Invisible"];

  const presenceRtnComparisonEventName = "presenceRTNComparison";
  const presenceRtnComparisonEventContext = "presenceRTNComparisonContext";

  function sendEventStreamEvent(rtnUserPresences, presenceApiPresences) {
    presenceApiPresences.forEach(presenceApiPresence => {
      const rtnUserPresence = rtnUserPresences.get(presenceApiPresence.userId);
      if (rtnUserPresence !== null && rtnUserPresence !== undefined) {
        const rtnPresenceType = RTNPresenceTypeToString[rtnUserPresence.PresenceType];
        const presenceApiPresenceType =
          PresenceAPIPresenceTypeToString[presenceApiPresence.userPresenceType];

        const rtnUniverseId = rtnUserPresence.UniverseId;
        const presenceApiUniverseId = presenceApiPresence.universeId;

        const rtnGameId = rtnUserPresence.GameId;
        const presenceApiGameId = presenceApiPresence.gameId;

        const rtnPlaceId = rtnUserPresence.PlaceId;
        const presenceApiPlaceId = presenceApiPresence.placeId;

        const rtnRootPlaceId = rtnUserPresence.RootPlaceId;
        const presenceApiRootPlaceId = presenceApiPresence.rootPlaceId;

        window.Roblox.EventStream.SendEventWithTarget(
          presenceRtnComparisonEventName,
          presenceRtnComparisonEventContext,
          {
            observedUserId: presenceApiPresence.userId,
            rtnPresenceType,
            rtnUniverseId,
            rtnGameId,
            rtnPlaceId,
            rtnRootPlaceId,
            presenceApiPresenceType,
            presenceApiUniverseId,
            presenceApiGameId,
            presenceApiPlaceId,
            presenceApiRootPlaceId,
          },
          window.Roblox.EventStream.TargetTypes.WWW,
        );
      }
    });
  }

  function getPresences(presenceChangesMap) {
    const userPresenceUrlConfig = {
      url: `${EnvironmentUrls.presenceApi}/v1/presence/users`,
      withCredentials: true,
    };

    const data = {
      userIds: Array.from(presenceChangesMap.keys()),
    };

    httpService
      .post(userPresenceUrlConfig, data)
      .then(result => {
        if (result?.data) {
          sendEventStreamEvent(presenceChangesMap, result.data.userPresences);
          document.dispatchEvent(
            new CustomEvent("Roblox.Presence.Update", { detail: result.data.userPresences }),
          );
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  function initializeRealTimeSubscriptions() {
    if (RealTime) {
      const realTimeClient = RealTime.Factory.GetClient();
      const { realtimeNotificationType, realtimeEventTypes } = presenceStatusConstants;
      realTimeClient.Subscribe(realtimeNotificationType, data => {
        const presenceChangesMap = new Map();
        data.forEach(each => {
          switch (each.Type) {
            case realtimeEventTypes.presenceChanged:
              presenceChangesMap.set(each.UserId, each.PresenceReport);
              break;
            default:
              break;
          }
        });

        if (presenceChangesMap.keys) {
          presenceStatusUpdateService.getPresences(presenceChangesMap);
        }
      });
    }
  }

  return {
    initializeRealTimeSubscriptions,
    getPresences,
  };
})();

if (authenticatedUser?.isAuthenticated) {
  document.addEventListener("DOMContentLoaded", () => {
    presenceStatusUpdateService.initializeRealTimeSubscriptions();
  });
}
