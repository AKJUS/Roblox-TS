import type { Dispatch, SetStateAction } from "react";
import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AccessManagementUpsellV2Service } from "Roblox";
import { UserProfileField, useUserProfiles } from "@rbx/user-profile-api-client";
import { useTranslation } from "@rbx/core-scripts/react";
import type { TrustedFriendsModalVariant } from "../constants/trustedFriendsModal";
import {
  triggerTrustedFriendVPCRecourseAmpFeatureName,
  connectionGraphCoreAmpNamespace,
  trustedFriendsModalVariants,
  trustedFriendsTranslationKeys,
} from "../constants/trustedFriendsModal";
import { trustedFriendStatusQueryKey } from "../constants/trustedFriendQueryKeys";
import {
  acceptTrustedFriendRequest,
  addTrustedFriendFromLink,
  sendTrustedFriendRequest,
  validateTrustedFriendLink,
} from "../services/trustedFriends";

async function startTrustedFriendVpcUpsell(targetUserId: number): Promise<void> {
  try {
    await AccessManagementUpsellV2Service.startAccessManagementUpsell({
      featureName: triggerTrustedFriendVPCRecourseAmpFeatureName,
      ampFeatureCheckData: [{ name: "targetUser", type: "UserId", value: String(targetUserId) }],
      isAsyncCall: false,
      usePrologue: true,
      namespace: connectionGraphCoreAmpNamespace,
      ampRecourseData: {
        targetUserId: targetUserId,
      },
    });
  } catch {
    throw new Error("Failed to start trusted friend VPC upsell");
  }
}

export type UseOnPrimaryButtonPressParams = {
  userId: number;
  linkTokens?: number[];
  onClose: (isSuccess: boolean) => void;
  setToastMessage: Dispatch<SetStateAction<string | null>>;
  isVPCFlow: boolean;
};

export function useOnPrimaryButtonPress({
  userId,
  linkTokens,
  onClose,
  setToastMessage,
  isVPCFlow,
}: UseOnPrimaryButtonPressParams): {
  performPrimaryAction: (args: { variant: TrustedFriendsModalVariant }) => Promise<void>;
} {
  const { translate } = useTranslation();
  const queryClient = useQueryClient();

  const profileFields = useMemo(
    () => [UserProfileField.Names.CombinedName, UserProfileField.Names.Username],
    [],
  );
  const { data: userProfiles } = useUserProfiles([userId], profileFields);
  const targetProfile = userProfiles?.[userId];

  const performPrimaryAction = useCallback(
    async (args: { variant: TrustedFriendsModalVariant }) => {
      const { variant } = args;
      const displayName = targetProfile?.names.combinedName ?? "";
      const userName = targetProfile?.names.username ?? "";

      const invalidateTrustedStatus = (): Promise<void> =>
        queryClient.invalidateQueries({ queryKey: trustedFriendStatusQueryKey(userId) });

      const onSuccess = async (): Promise<void> => {
        if (variant === trustedFriendsModalVariants.Friends) {
          setToastMessage(translate(trustedFriendsTranslationKeys.trustedFriendRequestSent));
        } else {
          setToastMessage(
            translate(trustedFriendsTranslationKeys.acceptedTrustedFriend, {
              displayName,
              userName,
            }),
          );
        }
        onClose(true);
        await invalidateTrustedStatus();
      };

      try {
        setToastMessage(null);

        if (isVPCFlow) {
          onClose(false);
          await startTrustedFriendVpcUpsell(userId);
          return;
        }

        switch (variant) {
          case trustedFriendsModalVariants.ShareLinkReceiver: {
            if (!linkTokens?.length) {
              throw new Error("useOnPrimaryButtonPress: linkTokens required for ShareLinkReceiver");
            }
            await validateTrustedFriendLink(userId, linkTokens);
            await addTrustedFriendFromLink(userId, linkTokens);
            await onSuccess();
            break;
          }
          case trustedFriendsModalVariants.Friends:
            await sendTrustedFriendRequest(userId);
            await onSuccess();
            break;
          case trustedFriendsModalVariants.RequestReceived:
            await acceptTrustedFriendRequest(userId);
            await onSuccess();
            break;
          case trustedFriendsModalVariants.TrustedFriends:
            onClose(true);
            break;
        }
      } catch {
        setToastMessage(translate(trustedFriendsTranslationKeys.genericError));
      }
    },
    [
      userId,
      linkTokens,
      translate,
      onClose,
      targetProfile,
      setToastMessage,
      queryClient,
      isVPCFlow,
    ],
  );

  return { performPrimaryAction };
}
