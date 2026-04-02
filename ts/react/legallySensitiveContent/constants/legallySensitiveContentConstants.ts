import ConsentName from '../enums/ConsentName';

/** Translation keys for phone discoverability when `web-rename-friends` is on (keep in sync with auditUtils). */
export const PHONE_DISCOVERABILITY_CONSENT_FRIENDS_RENAME_KEY =
  'Description.PhoneNumberDiscoverabilityConsent.FriendsRename';
export const PHONE_DISCOVERABILITY_PARENT_SIDE_CONSENT_FRIENDS_RENAME_KEY =
  'Description.ParentSide.PhoneNumberDiscoverabilityConsent.FriendsRename';

// source content ids are generated from translations hub
const legallySensitiveContentConstants = {
  [ConsentName.phoneNumberDiscoverabilitySetting]: {
    titleTranslationKey: 'Heading.FriendDiscovery',
    titleSourceContentId: '4063304',
    consentTranslationKey: 'Description.PhoneNumberDiscoverabilityConsent',
    consentSourceContentId: '4054088'
  },
  [ConsentName.phoneNumberDiscoverabilitySettingParentSide]: {
    titleTranslationKey: 'Heading.FriendDiscovery',
    titleSourceContentId: '4063304',
    consentTranslationKey: 'Description.ParentSide.PhoneNumberDiscoverabilityConsent',
    consentSourceContentId: '4102472'
  },
  [ConsentName.phoneNumberDiscoverabilityUpsell]: {
    titleTranslationKey: 'Heading.TurnOnFriendDiscovery',
    titleSourceContentId: '4123720',
    consentTranslationKey: 'Description.PhoneNumberDiscoverabilityUpsellConsent',
    consentSourceContentId: '4123464',
    actionButtonTextTranslationKey: 'Action.FriendDiscovery.TurnOn',
    actionButtonTextSourceContentId: '4123208',
    neutralButtonTextTranslationKey: 'Action.FriendDiscovery.NotNow',
    neutralButtonTextSourceContentId: '4122952'
  },
  [ConsentName.personalizedAdsSetting]: {
    titleTranslationKey: 'Heading.PersonalizeYourAds',
    titleSourceContentId: '4190024',
    consentTranslationKey: 'Description.PersonalizeAds',
    consentSourceContentId: '4190536',
    linkStart: '<a href="https://en.help.roblox.com/hc/articles/28943243301780" class="text-link">',
    linkEnd: '</a>',
    linkStartParam: '{linkStart}',
    linkEndParam: '{linkEnd}'
  },
  [ConsentName.sellShareDataSetting]: {
    titleTranslationKey: 'Heading.DataSellingAndSharing',
    titleSourceContentId: '4190280',
    consentTranslationKey: 'Description.DataSellingAndSharing',
    consentSourceContentId: '4190792',
    linkStart: '<a href="https://en.help.roblox.com/hc/articles/28943243301780" class="text-link">',
    linkEnd: '</a>',
    linkStartParam: '{linkStart}',
    linkEndParam: '{linkEnd}'
  },
  [ConsentName.allowMarketingEmailCheckboxEmailVerification]: {
    consentTranslationKey: 'Description.EmailNotificationsOptIn',
    consentSourceContentId: '4557640'
  },
  [ConsentName.voiceDataConsentSetting]: {
    titleTranslationKey: 'Heading.VoiceDataConsent',
    titleSourceContentId: '4565320',
    consentTranslationKey: 'Description.VoiceDataConsent',
    consentSourceContentId: '4565576',
    linkStart: '<a href="https://en.help.roblox.com/hc/articles/5704050147604" class="text-link">',
    linkEnd: '</a>',
    linkStartParam: '{linkStart}',
    linkEndParam: '{linkEnd}'
  },
  [ConsentName.voiceDataConsentSettingParentSide]: {
    titleTranslationKey: 'Heading.VoiceDataConsent',
    titleSourceContentId: '4565320',
    consentTranslationKey: 'Description.ParentSide.VoiceDataConsent',
    consentSourceContentId: '4565832',
    linkStart: '<a href="https://en.help.roblox.com/hc/articles/5704050147604" class="text-link">',
    linkEnd: '</a>',
    linkStartParam: '{linkStart}',
    linkEndParam: '{linkEnd}'
  }
};

export default legallySensitiveContentConstants;
