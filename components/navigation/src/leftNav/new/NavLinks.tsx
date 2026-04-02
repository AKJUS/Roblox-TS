import { useEffect, useState } from "react";
import classNames from "classnames";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import environmentUrls from "@rbx/environment-urls";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import * as http from "@rbx/core-scripts/http";
import { useTranslation } from "@rbx/core-scripts/react";
import { callBehaviour } from "@rbx/core-scripts/guac";
import { AuthenticatedUser, isBlackbirdUser } from "@rbx/core-scripts/meta/user";
import { isEnabled as isBlackbirdEnabled } from "@rbx/core-scripts/meta/subscription";
import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import paymentFlowAnalyticsService from "@rbx/core-scripts/payments-flow";
import {
  Icon,
  TIconProps,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
  Button,
  Badge,
} from "@rbx/foundation-ui";
import {
  BadgeSizes,
  currentUserHasVerifiedBadge,
  VerifiedBadgeIconContainer,
} from "@rbx/roblox-badges";
import { Thumbnail2d, ThumbnailTypes } from "@rbx/thumbnails";
import { useRealTime } from "./useRealTime";

// Temporarily copied from `@rbx/foundation-ui` since the NavigationRail component is not available yet.
const interactable =
  "relative clip group/interactable focus-visible:outline-focus disabled:outline-none";

const StateLayer = () => (
  <div
    role="presentation"
    className="absolute inset-[0] transition-colors group-hover/interactable:bg-[var(--color-state-hover)] group-active/interactable:bg-[var(--color-state-press)] group-disabled/interactable:bg-none"
  />
);

const navItemClasses =
  "content-emphasis text-title-large flex items-center gap-small padding-left-xsmall padding-right-xxsmall radius-medium";

const iconContainer = "size-1000 grow-0 shrink-0 basis-auto flex justify-center items-center";

const ProfileNavItem = ({ id, displayName }: { id: number; displayName: string }) => (
  <li>
    <a href="/users/profile" className={classNames(navItemClasses, interactable)}>
      <StateLayer />
      <span className={iconContainer}>
        <span className="radius-circle clip size-600">
          <Thumbnail2d targetId={id} type={ThumbnailTypes.avatarHeadshot} altName={displayName} />
        </span>
      </span>
      <span className="flex gap-xsmall min-width-0 align-items-center">
        <span className="text-truncate-end text-no-wrap">{displayName}</span>
        {currentUserHasVerifiedBadge() ? (
          <VerifiedBadgeIconContainer size={BadgeSizes.CAPTIONHEADER} />
        ) : null}
        {isBlackbirdUser() ? (
          // TODO(SUBS-4332)
          <Icon name="icon-regular-paper-airplane" size="Small" />
        ) : null}
      </span>
    </a>
  </li>
);

const NavItem = ({
  path,
  isCurrentPath,
  icon,
  text,
  notification,
}: {
  path: `/${string}` | URL;
  isCurrentPath: boolean;
  icon: TIconProps["name"];
  text: string;
  notification?: string;
}) => {
  const href = path instanceof URL ? path.href : getAbsoluteUrl(path);
  return (
    <li key={href}>
      <a
        href={href}
        className={classNames(navItemClasses, interactable, isCurrentPath && "bg-surface-300")}
      >
        <StateLayer />
        <span className={iconContainer}>
          <Icon name={icon} size="Large" />
        </span>
        <span className="min-width-0 text-truncate-end text-no-wrap">{text}</span>
        {notification && (
          <span className="fill basis-auto padding-x-small flex justify-end items-center">
            <Badge label={notification} variant="Contrast" />
          </span>
        )}
      </a>
    </li>
  );
};

const ShopNavItem = () => {
  const { translate } = useTranslation();
  const [shopDialogOpen, setShopDialogOpen] = useState(false);
  return (
    <li>
      <button
        type="button"
        className={classNames("bg-none width-full stroke-none", navItemClasses, interactable)}
        onClick={() => {
          setShopDialogOpen(!shopDialogOpen);
        }}
      >
        <StateLayer />
        <span className={iconContainer}>
          <Icon name="icon-regular-building-store" size="Large" />
        </span>
        <span>{translate("Label.OfficialStore")}</span>
      </button>
      <Dialog
        open={shopDialogOpen}
        size="Medium"
        isModal
        hasCloseAffordance
        closeLabel={translate("Action.Close")}
        onOpenChange={() => {
          setShopDialogOpen(false);
        }}
      >
        <DialogContent>
          <DialogBody>
            <DialogTitle>{translate("Heading.LeavingRoblox")}</DialogTitle>
            <p>{translate("Description.RetailWebsiteRedirect")}</p>
            <p>{translate("Description.PurchaseAgeWarning")}</p>
          </DialogBody>
          <DialogFooter className="flex gap-medium justify-end">
            <Button
              variant="Standard"
              onClick={() => {
                setShopDialogOpen(false);
              }}
            >
              {translate("Action.Cancel")}
            </Button>
            <Button
              as="a"
              variant="Emphasis"
              href={decodeURIComponent(environmentUrls.amazonWebStoreLink)}
              target="_blank"
              rel="noreferrer"
              onClick={() => {
                setShopDialogOpen(false);
                sendEventWithTarget("clickContinueToAmazonStore", "click", {}, targetTypes.WWW);
              }}
            >
              {translate("Action.Continue")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  );
};

const PremiumNavItem = () => {
  const { translate } = useTranslation();
  return (
    <li>
      <Button
        as="a"
        href={getAbsoluteUrl("/premium/membership?ctx=leftnav")}
        variant="Standard"
        size="Medium"
        className="grow"
        onClick={() => {
          paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
            paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_PREMIUM_PURCHASE,
            false,
            paymentFlowAnalyticsService.ENUM_VIEW_NAME.LEFT_NAVIGATION_BAR,
            paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
            paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.GET_PREMIUM,
          );
        }}
      >
        {translate("ActionsGetPremium")}
      </Button>
    </li>
  );
};

const blackbirdPathRegex = /^\/blackbird(\/|$)/;

const BlackbirdNavItem = ({ currentPath }: { currentPath: string }) => {
  const { translate } = useTranslation();

  return (
    <NavItem
      path="/blackbird"
      isCurrentPath={blackbirdPathRegex.test(currentPath)}
      icon="icon-regular-paper-airplane"
      text={translate("Label.Blackbird")}
    />
  );
};

const BlackbirdUpsellNavItem = ({ currentPath }: { currentPath: string }) => {
  const { translate } = useTranslation();

  if (blackbirdPathRegex.test(currentPath)) {
    return null;
  }

  return (
    <li className="padding-top-xsmall">
      <a
        href="/blackbird"
        className="gap-y-medium flex flex-col padding-medium bg-shift-100 stroke-default stroke-thick radius-medium text-body-medium"
      >
        <Icon name="icon-regular-paper-airplane" />
        <span>
          {translate("Description.ExclusiveBenefits", {
            product: translate("Label.Blackbird"),
          })}
        </span>
        <span className="content-default [text-decoration:underline] [text-decoration-skip-ink:none] [text-underline-offset:3px]">
          {translate("Action.Subscribe")}
        </span>
      </a>
    </li>
  );
};

const plusAbbreviate = (num: number, limit: number) => (num > limit ? `${limit}+` : num.toString());

const LeftNavigation = ({ user }: { user: AuthenticatedUser }) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const id = user.id!;
  const [currentPath, setCurrentPath] = useState(new URL(window.location.href).pathname);

  // Observe route changes
  useEffect(() => {
    let oldPath = new URL(window.location.href).pathname;
    const observer = new MutationObserver(() => {
      const newPath = new URL(window.location.href).pathname;
      if (oldPath !== newPath) {
        oldPath = newPath;
        setCurrentPath(newPath);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const { translate } = useTranslation();

  const { data: connectionsToFriendsRenameEnabled } = useQuery({
    queryKey: ["connections-to-friends-rename"],
    queryFn: async () => {
      const data = await callBehaviour<{ connectionsToFriendsRenameEnabled: boolean }>(
        "web-rename-friends",
      );
      return data.connectionsToFriendsRenameEnabled;
    },
    placeholderData: false,
  });

  const queryClient = useQueryClient();

  const { data: friendRequestCount } = useQuery({
    queryKey: ["friend-request-count"],
    queryFn: () =>
      http
        .get<{ count: number }>({
          url: `${environmentUrls.friendsApi}/v1/user/friend-requests/count`,
          withCredentials: true,
        })
        .then(({ data }) => data.count),
    staleTime: Infinity,
  });

  useRealTime({
    event: "FriendshipNotifications",
    queryKey: ["friend-request-count"],
    queryClient,
  });

  const { data: messageUnreadCount } = useQuery({
    queryKey: ["message-unread-count"],
    queryFn: () =>
      http
        .get<{ count: number }>({
          url: `${environmentUrls.privateMessagesApi}/v1/messages/unread/count`,
          withCredentials: true,
        })
        .then(({ data }) => data.count),
    staleTime: Infinity,
  });

  useRealTime({
    event: "Roblox.Messages.CountChanged",
    queryKey: ["message-unread-count"],
    queryClient,
  });

  const { data: tradeInboundCount } = useQuery({
    queryKey: ["trade-inbound-count"],
    queryFn: () =>
      http
        .get<{ count: number }>({
          url: `${environmentUrls.tradesApi}/v1/trades/inbound/count`,
          withCredentials: true,
        })
        .then(({ data }) => data.count),
    staleTime: Infinity,
  });

  return (
    <nav>
      <ul className="flex flex-col gap-small">
        <ProfileNavItem id={id} displayName={user.displayName ?? ""} />
        <NavItem
          path="/home"
          isCurrentPath={/^\/home(\/|$)/.test(currentPath)}
          icon="icon-regular-house"
          text={translate("Label.sHome")}
        />
        <NavItem
          path="/users/profile"
          isCurrentPath={/^\/users\/(\d+\/)?profile(\/|$)/.test(currentPath)}
          icon="icon-regular-person"
          text={translate("Label.sProfile")}
        />
        {isBlackbirdEnabled() ? <BlackbirdNavItem currentPath={currentPath} /> : null}
        <NavItem
          path="/my/messages/#!/inbox"
          isCurrentPath={/^\/my\/messages(\/|$)/.test(currentPath)}
          icon="icon-regular-speech-bubble-align-center"
          text={translate("Label.sMessages")}
          notification={messageUnreadCount ? plusAbbreviate(messageUnreadCount, 500) : undefined}
        />
        <NavItem
          path={friendRequestCount ? "/users/friends#!/friend-requests" : "/users/friends"}
          isCurrentPath={/^\/users\/(\d+\/)?friends(\/|$)/.test(currentPath)}
          icon="icon-regular-two-people"
          text={translate(connectionsToFriendsRenameEnabled ? "Label.Friends" : "Label.Connect")}
          notification={friendRequestCount ? plusAbbreviate(friendRequestCount, 500) : undefined}
        />
        <NavItem
          path="/my/avatar"
          isCurrentPath={/^\/my\/avatar(\/|$)/.test(currentPath)}
          icon="icon-regular-person-standing"
          text={translate("Label.sAvatar")}
        />
        <NavItem
          path="/users/inventory"
          isCurrentPath={/^\/users\/(\d+\/)?inventory(\/|$)/.test(currentPath)}
          icon="icon-regular-backpack"
          text={translate("Label.sInventory")}
        />
        <NavItem
          path="/trades"
          isCurrentPath={/^\/trades(\/|$)/.test(currentPath)}
          icon="icon-regular-hand-two-arrows-horizontal"
          text={translate("Label.sTrade")}
          notification={tradeInboundCount ? plusAbbreviate(tradeInboundCount, 999) : undefined}
        />
        <NavItem
          path="/communities"
          isCurrentPath={/^\/communities(\/|$)/.test(currentPath)}
          icon="icon-regular-three-people"
          text={translate("Label.sGroups")}
        />
        <NavItem
          path={new URL("https://blog.roblox.com")}
          isCurrentPath={false}
          icon="icon-regular-fountain-pen-nib"
          text={translate("Label.sBlog")}
        />
        <ShopNavItem />
        <NavItem
          path="/giftcards-us"
          isCurrentPath={/^\/giftcards-us(\/|$)/.test(currentPath)}
          icon="icon-regular-gift-card"
          text={translate("Label.GiftCards")}
        />
        {!isBlackbirdEnabled() ? <PremiumNavItem /> : null}
        {isBlackbirdEnabled() && !isBlackbirdUser() ? (
          <BlackbirdUpsellNavItem currentPath={currentPath} />
        ) : null}
      </ul>
    </nav>
  );
};

export default LeftNavigation;
