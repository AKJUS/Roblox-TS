import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import "../trustedFriends.css";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
  Icon,
  Snackbar,
} from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import {
  trustedFriendStatusQueryKey,
  trustedFriendVpcAmpQueryKey,
} from "../constants/trustedFriendQueryKeys";
import {
  TRUSTED_FRIENDS_HELP_ARTICLE_URL,
  TrustedConnectionStatus,
  connectionGraphCoreAmpNamespace,
  trustedFriendVpcModalVariantAmpFeatureName,
  trustedFriendsModalVariantToText,
  trustedFriendsModalVariants,
  trustedFriendsTranslationKeys,
  type TrustedFriendsModalVariant,
} from "../constants/trustedFriendsModal";
import { useOnPrimaryButtonPress } from "../hooks/useOnPrimaryButtonPress";
import { fetchFeatureCheckResponseWithNamespace } from "../services/accessManagement";
import { getTrustedFriendStatus } from "../services/trustedFriends";
import SocialMetadataSection from "./SocialMetadataSection";

type targetUserAmpExtraParameter = {
  name: "targetUser";
  type: "UserId";
  value: number;
};

export type TrustedFriendsModalProps = {
  open: boolean;
  onClose: (isSuccess: boolean) => void;
  userId: number;
  linkTokens?: number[];
};

const TrustedFriendsModal = ({
  open,
  onClose,
  userId,
  linkTokens,
}: TrustedFriendsModalProps): React.JSX.Element => {
  const { translate } = useTranslation();

  const hasLinkTokens = (linkTokens?.length ?? 0) > 0;

  const { data: trustedStatusData, isFetched: isTrustedFriendStatusFetched } = useQuery({
    queryKey: trustedFriendStatusQueryKey(userId),
    queryFn: () => getTrustedFriendStatus(userId),
    enabled: open,
  });

  const { data: vpcAmpData, isSuccess: vpcAmpSuccess } = useQuery({
    queryKey: trustedFriendVpcAmpQueryKey(userId),
    queryFn: () =>
      fetchFeatureCheckResponseWithNamespace<{ access: string }>(
        trustedFriendVpcModalVariantAmpFeatureName,
        [
          {
            name: "targetUser",
            type: "UserId",
            value: userId,
          } satisfies targetUserAmpExtraParameter,
        ],
        undefined,
        connectionGraphCoreAmpNamespace,
      ),
    enabled: open,
    staleTime: 60_000,
  });

  const isVPCFlow = vpcAmpSuccess && vpcAmpData.access === "Granted";

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { performPrimaryAction } = useOnPrimaryButtonPress({
    userId,
    linkTokens,
    onClose,
    setToastMessage,
    isVPCFlow,
  });

  const resolvedVariant = useMemo((): TrustedFriendsModalVariant | "pending" | "invalid" => {
    if (!open || (!hasLinkTokens && !isTrustedFriendStatusFetched)) {
      return "pending";
    }
    if (hasLinkTokens) {
      return trustedFriendsModalVariants.ShareLinkReceiver;
    }
    const rawStatus = trustedStatusData?.status;
    if (!rawStatus) {
      return trustedFriendsModalVariants.Friends;
    }
    const mapped =
      rawStatus === TrustedConnectionStatus.RequestIgnored
        ? trustedFriendsModalVariants.RequestReceived
        : rawStatus;
    const allowed = Object.values(trustedFriendsModalVariants) as TrustedFriendsModalVariant[];
    return allowed.find(v => v === mapped) ?? "invalid";
  }, [open, hasLinkTokens, isTrustedFriendStatusFetched, trustedStatusData]);

  useEffect(() => {
    if (resolvedVariant === "invalid") {
      setToastMessage(translate(trustedFriendsTranslationKeys.genericError));
      onClose(false);
    }
  }, [resolvedVariant, translate, onClose]);

  const modalVariant: TrustedFriendsModalVariant =
    resolvedVariant !== "pending" && resolvedVariant !== "invalid"
      ? resolvedVariant
      : trustedFriendsModalVariants.Friends;

  const copyEntry = useMemo(() => trustedFriendsModalVariantToText[modalVariant], [modalVariant]);

  const isVariantLoaded = open && resolvedVariant !== "pending" && resolvedVariant !== "invalid";

  const dismissToast = useCallback((): void => {
    setToastMessage(null);
  }, []);

  const handleDialogOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        onClose(false);
      }
    },
    [onClose],
  );

  const onPrimaryButtonClick = useCallback(() => {
    if (resolvedVariant === "pending" || resolvedVariant === "invalid") {
      return;
    }
    performPrimaryAction({ variant: resolvedVariant }).catch(() => undefined);
  }, [resolvedVariant, performPrimaryAction]);

  return (
    <React.Fragment>
      <Dialog
        open={isVariantLoaded}
        onOpenChange={handleDialogOpenChange}
        size="Medium"
        isModal
        hasCloseAffordance
        closeLabel="Close"
      >
        <DialogContent>
          <DialogBody className="flex flex-col gap-medium">
            <DialogTitle className="text-heading-small margin-none">
              {translate(copyEntry.title)}
            </DialogTitle>
            <div className="text-body-medium content-default flex flex-col gap-xsmall">
              {translate(copyEntry.description)}
              <a
                href={TRUSTED_FRIENDS_HELP_ARTICLE_URL}
                target="_blank"
                rel="noreferrer"
                className="trusted-friends-modal-learn-more-link text-body-medium content-default"
              >
                {translate(trustedFriendsTranslationKeys.learnMore)}
              </a>
            </div>
            <SocialMetadataSection userId={userId} />
          </DialogBody>
          <DialogFooter className="flex flex-col gap-small">
            <div className="flex width-full min-width-0 flex-row gap-small items-center">
              <Button
                variant="Emphasis"
                size="Medium"
                className="fill min-width-0 flex-1 basis-0"
                onClick={onPrimaryButtonClick}
              >
                <span className="flex width-full min-width-0 flex-row items-center justify-center gap-small">
                  {isVPCFlow ? (
                    <Icon
                      name="icon-regular-lock-closed"
                      size="Medium"
                      className="flex shrink-0 items-center justify-center"
                      aria-hidden
                    />
                  ) : null}
                  <span className="min-width-0">{translate(copyEntry.primary)}</span>
                </span>
              </Button>
              {copyEntry.secondary ? (
                <Button
                  variant="Standard"
                  size="Medium"
                  className="fill min-width-0 flex-1 basis-0"
                  onClick={() => {
                    onClose(false);
                  }}
                >
                  {translate(copyEntry.secondary)}
                </Button>
              ) : null}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {toastMessage ? (
        <Snackbar title={toastMessage} onClose={dismissToast} shouldAutoDismiss />
      ) : null}
      <div id="access-management-upsell-container" />
    </React.Fragment>
  );
};

export default TrustedFriendsModal;
