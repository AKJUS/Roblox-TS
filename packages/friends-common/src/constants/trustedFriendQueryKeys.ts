/** Shared key for `getTrustedFriendStatus` — invalidate after mutations so reopening the modal sees current status. */
export const trustedFriendStatusQueryKey = (userId: number): readonly [string, number] => [
  "trustedFriendStatus",
  userId,
];

export const trustedFriendVpcAmpQueryKey = (userId: number): readonly [string, number] => [
  "trustedFriendVpcAmp",
  userId,
];
