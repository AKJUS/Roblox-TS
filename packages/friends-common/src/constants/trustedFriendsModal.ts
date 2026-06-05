export const TrustedConnectionStatus = {
  Invalid: "Invalid",
  NotFriends: "NotFriends",
  Friends: "Friends",
  TrustedFriends: "TrustedFriends",
  RequestSent: "RequestSent",
  RequestReceived: "RequestReceived",
  RequestIgnored: "RequestIgnored",
} as const;

export type TrustedConnectionStatusEnum =
  | "Invalid"
  | "NotFriends"
  | "Friends"
  | "TrustedFriends"
  | "RequestSent"
  | "RequestReceived"
  | "RequestIgnored";

export const trustedFriendsTranslationKeys = {
  connectedOneYear: "Label.ConnectedOneYear",
  connectedNumYears: "Label.ConnectedNumYears",
  connectedOneMonth: "Label.ConnectedOneMonth",
  connectedNumMonths: "Label.ConnectedNumMonths",
  connectedOneDay: "Label.ConnectedOneDay",
  connectedNumDays: "Label.ConnectedNumDays",
  newFriend: "Label.NewFriend",

  ageGroupLabel: "Label.AgeGroupV2",
  mutualFriends: "Label.MutualFriendsTitle",
  joinedInYear: "Label.JoinedInYear",

  friendRequestOriginPlayerSearch: "Label.FromSearch",
  friendRequestOriginQrCode: "Description.FromQrCode",
  friendRequestOriginPhoneContactImporter: "Description.FromContacts",

  learnMore: "LinkText.LearnMore",

  genericError: "Message.SomethingWentWrong",

  acceptedTrustedFriend: "TrustedFriend.Accepted.Toast",
  trustedFriendRequestSent: "TrustedFriend.Toast.TrustedFriendRequestSent",
} as const;

export const trustedFriendsModalVariants = {
  Friends: TrustedConnectionStatus.Friends,
  RequestReceived: TrustedConnectionStatus.RequestReceived,
  TrustedFriends: TrustedConnectionStatus.TrustedFriends,
  ShareLinkReceiver: "ShareLinkReceiver",
} as const;

export type TrustedFriendsModalVariant =
  (typeof trustedFriendsModalVariants)[keyof typeof trustedFriendsModalVariants];

type TrustedFriendsModalCopyEntry = {
  title: string;
  description: string;
  primary: string;
  secondary?: string;
};

export const TRUSTED_FRIENDS_HELP_ARTICLE_URL =
  "https://help.roblox.com/hc/articles/37725513985812" as const;

export const trustedFriendVpcModalVariantAmpFeatureName =
  "ShowTrustedFriendVPCModalVariant" as const;

export const triggerTrustedFriendVPCRecourseAmpFeatureName =
  "TriggerTrustedFriendVPCRecourse" as const;

export const connectionGraphCoreAmpNamespace = "connection_graph_core/ConnectionGraphCore" as const;

export const trustedFriendsModalVariantToText: Record<
  TrustedFriendsModalVariant,
  TrustedFriendsModalCopyEntry
> = {
  [trustedFriendsModalVariants.Friends]: {
    title: "TrustedFriend.Label.AddTrustedFriend",
    description: "Description.DoMoreWithTrustedFriends",
    primary: "Action.Add",
    secondary: "Button.DontAdd",
  },
  [trustedFriendsModalVariants.RequestReceived]: {
    title: "TrustedFriend.AddBack.Header",
    description: "TrustedFriends.InfoLabel.FriendsRename",
    primary: "Action.Accept",
    secondary: "Action.DontAccept",
  },
  [trustedFriendsModalVariants.ShareLinkReceiver]: {
    title: "TrustedFriend.AddBack.Header",
    description: "TrustedFriends.InfoLabel.FriendsRename",
    primary: "Button.AddViaLink",
  },
  [trustedFriendsModalVariants.TrustedFriends]: {
    title: "TrustedFriend.Info.Modal.Header",
    description: "Description.YouCanDoMoreWithTrustedFriends",
    primary: "Action.OK",
  },
};
