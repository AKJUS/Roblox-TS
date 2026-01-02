import { httpService } from 'core-utilities';
import { EnvironmentUrls } from 'Roblox';
import {
  TGetFriendsCountResponse,
  TGetAllOnlineFriendsResponse,
  TUserPresenceType,
  TFindFriendsResponse,
  TGetProfilesResponse,
  TFriend,
  TPresence,
  TOnlineFriendType,
  TGetNewFriendRequestsCountResponse,
  TProfile,
  TGetTrustedConnectionStatusResponse
} from '../types/friendsCarouselTypes';
import canAccessTCIndicatorViaAmp from '../../../../js/react/friends/util/tcIndicatorUtil';

const getFriendsCount = async (userId: number): Promise<TGetFriendsCountResponse> => {
  const urlConfig = {
    url: `${EnvironmentUrls.friendsApi}/v1/users/${userId}/friends/count`,
    retryable: true,
    withCredentials: true
  };
  const { data }: { data: TGetFriendsCountResponse } = await httpService.get(urlConfig);
  return data;
};

const getAllOnlineFriends = async (userId: number): Promise<TGetAllOnlineFriendsResponse> => {
  const urlConfig = {
    url: `${EnvironmentUrls.friendsApi}/v1/users/${userId}/friends/online`,
    retryable: true,
    withCredentials: true
  };

  const { data }: { data: TGetAllOnlineFriendsResponse } = await httpService.get(urlConfig);
  return data;
};

const getPaginatedFriends = async (
  userId: number,
  isOwnUser: boolean
): Promise<TFindFriendsResponse> => {
  const nonSortedUrl = `${EnvironmentUrls.friendsApi}/v1/users/${userId}/friends/find`;
  const urlConfig = {
    url: isOwnUser ? `${nonSortedUrl}?userSort=1` : nonSortedUrl,
    retryable: true,
    withCredentials: true
  };

  const { data }: { data: TFindFriendsResponse } = await httpService.get(urlConfig);
  return data;
};

const getProfiles = async (userIds: number[]): Promise<TGetProfilesResponse> => {
  const urlConfig = {
    url: `${EnvironmentUrls.apiGatewayUrl}/user-profile-api/v1/user/profiles/get-profiles`,
    retryable: true,
    withCredentials: true
  };

  const requestData = {
    userIds,
    fields: ['names.combinedName', 'isVerified']
  };

  const { data }: { data: TGetProfilesResponse } = await httpService.post(urlConfig, requestData);
  return data;
};

const getTrustedConnectionStatus = async (
  targetUserId: number
): Promise<TGetTrustedConnectionStatusResponse> => {
  const urlConfig = {
    url: `${EnvironmentUrls.friendsApi}/v1/my/trusted-friends/${targetUserId}/status`,
    retryable: true,
    withCredentials: true
  };

  const { data }: { data: TGetTrustedConnectionStatusResponse } = await httpService.get(urlConfig);
  return data;
};

const getFriends = async (userId: number, isOwnUser: boolean): Promise<TFriend[]> => {
  const onlineFriendsResponse = isOwnUser ? (await getAllOnlineFriends(userId)).data : [];
  onlineFriendsResponse.sort((friend1: TOnlineFriendType, friend2: TOnlineFriendType): number => {
    const presenceSortMapping: { [key: string]: number } = { InGame: 0, Online: 1, InStudio: 2 };
    const presenceType1 = friend1.userPresence.UserPresenceType;
    const presenceType2 = friend2.userPresence.UserPresenceType;
    if (!(presenceType1 in presenceSortMapping && presenceType2 in presenceSortMapping)) {
      return -1;
    }

    return presenceSortMapping[presenceType1] < presenceSortMapping[presenceType2] ? -1 : 1;
  });
  const offlineFriends = (await getPaginatedFriends(userId, isOwnUser)).PageItems;

  const presenceMapping = new Map<number, TUserPresenceType>();

  // eslint-disable-next-line no-restricted-syntax
  for (const onlineFriend of onlineFriendsResponse) {
    presenceMapping.set(onlineFriend.id, onlineFriend.userPresence);
  }

  const onlineFriendsIds: number[] = onlineFriendsResponse.map(friend => friend.id);
  const offlineFriendsIds: number[] = offlineFriends
    .filter(friend => !onlineFriendsIds.includes(friend.id))
    .map(friend => friend.id);
  const friendIds: number[] = [...onlineFriendsIds, ...offlineFriendsIds];

  const friendProfiles = (await getProfiles(friendIds)).profileDetails;
  const friendProfilesMap = new Map<number, TProfile>(
    friendProfiles.map(profile => [profile.userId, profile])
  );
  const canAccessTCIndicatorViaAmpStatus = await canAccessTCIndicatorViaAmp();

  const friends: TFriend[] = await Promise.all(
    friendIds.map(async id => {
      const isOnline = presenceMapping.has(id);
      const presence: TPresence = {
        isOnline,
        isInGame: isOnline && presenceMapping.get(id)?.UserPresenceType === 'InGame',
        lastLocation: isOnline ? presenceMapping.get(id)?.lastLocation : undefined,
        gameId: isOnline ? presenceMapping.get(id)?.gameInstanceId : undefined,
        universeId: isOnline ? presenceMapping.get(id)?.universeId : undefined,
        placeId: isOnline ? presenceMapping.get(id)?.placeId : undefined
      };
      const trustedConnectionStatus = canAccessTCIndicatorViaAmpStatus
        ? await getTrustedConnectionStatus(id)
        : { status: 'Invalid' };
      const friend = friendProfilesMap.get(id);
      return {
        id,
        combinedName: friend?.names.combinedName,
        presence,
        hasVerifiedBadge: friend?.isVerified ?? false,
        isTrustedConnection: trustedConnectionStatus.status === 'TrustedFriends'
      };
    })
  );

  return friends;
};

const getNewFriendRequestsCount = async (): Promise<number> => {
  const urlConfig = {
    url: `${EnvironmentUrls.friendsApi}/v1/my/new-friend-requests/count`,
    retryable: true,
    withCredentials: true
  };

  const { data }: { data: TGetNewFriendRequestsCountResponse } = await httpService.get(urlConfig);
  return data.count;
};

export default {
  getFriendsCount,
  getFriends,
  getNewFriendRequestsCount,
  getTrustedConnectionStatus
};
