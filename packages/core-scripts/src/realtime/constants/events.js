export const realtimeEvents = {
  Notification: "Roblox.RealTime.Events.Notification",
  ConnectionEvent: "Roblox.RealTime.Events.ConnectionEvent",
  RequestForConnectionStatus: "Roblox.RealTime.Events.RequestForConnectionStatus",
};

// Topic-based notification channels (Phase 1+)
// Uses localStorage for cross-tab communication
export const topicChannels = {
  Notification: "Roblox.RealTime.Topic.LocalStorage.Notification",
  SubscribeRequest: "Roblox.RealTime.Topic.LocalStorage.SubscribeRequest",
  LeaderReconnected: "Roblox.RealTime.Topic.LocalStorage.LeaderReconnected",
};
