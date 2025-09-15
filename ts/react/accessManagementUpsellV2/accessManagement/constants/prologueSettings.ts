import { TranslateFunction } from 'react-utilities';
import { PrologueConstants } from './viewConstants';
import ExpNewChildModal from '../../enums/ExpNewChildModal';

// Feature team can choose to define their promptline and title here,
// also add the translation under Amp.Upsell namespace.
// If not defined, will use the default version of prologues.
const promptLineDictionary: prologueSettingDictionary = {
  // Example
  // {AmpFeatureName}: 'PrologueSetting.PromptLine.{AmpFeatureName}'
  CanCorrectAge: 'PrologueSetting.PromptLine.CanCorrectAge'
};

const titleDictionary: prologueSettingDictionary = {
  // Example
  // {AmpFeatureName}: 'PrologueSetting.Title.{AmpFeatureName}'
};

export function getProloguePromptLine(
  featureName: string,
  recourseParameters?: Record<string, string> | null
): string {
  // Temporary fix to show the "experiences" string only for the contentAgeRestriction
  // case of "CanChangeSetting", since the "CanChangeSetting" feature can be used for other settings.
  if (featureName === 'CanChangeSetting') {
    if (recourseParameters?.contentAgeRestriction !== undefined) {
      return 'PrologueSetting.PromptLine.CanChangeSetting';
    }
  }

  return promptLineDictionary[featureName];
}

export function getPrologueTitle(featureName: string): string {
  return titleDictionary[featureName];
}

export type prologueSettingDictionary = {
  [featureName: string]: string;
};

export function getPrologueTranslatedTitle(
  featureName: string,
  defaultTitle: string,
  translate: TranslateFunction
): string {
  const featureTitle = getPrologueTitle(featureName);
  const translatedTitle = featureTitle || defaultTitle;
  return translate(translatedTitle);
}

export function getPrologueTranslatedBodyText(
  featureName: string,
  defaultText: string,
  connectingText: string,
  translate: TranslateFunction,
  recourseParameters?: Record<string, string> | null,
  expChildModalType?: string
): string {
  let prologueReasonText: string;

  // Currently, the strings use two styles to get the reason for the prologue:
  // 1. Direct approach: Use a complete translation key (enable purchases, unblock user/experience)
  //     e.g., user blocking uses one string: "To unblock {displayName}, you need parent permission"
  // 2. Bridge approach: Use prompt line + connecting text (CanCorrectAge, CanChangeSetting)
  //     e.g., age correction uses two strings: "To update your birthday" and "you need parent permission"

  // First, look for the prologue reason assuming the direct approach.
  if (recourseParameters?.enablePurchases !== undefined) {
    prologueReasonText = translate(PrologueConstants.Description.VpcEnablePurchase);
  } else if (recourseParameters?.friendManagementAction === 'Unblock') {
    prologueReasonText = translate(PrologueConstants.Description.VpcUnblockUser, {
      displayName: recourseParameters.displayName
    });
  } else if (recourseParameters?.experienceManagementAction === 'Unblock') {
    prologueReasonText = translate(PrologueConstants.Description.VpcUnblockExperience, {
      experienceName: recourseParameters.experienceName
    });
  } else {
    // If it's a feature that uses the bridge approach, get the prompt line and add the connecting text.
    const featurePromptLine = getProloguePromptLine(featureName, recourseParameters);
    if (featurePromptLine) {
      prologueReasonText = `${translate(featurePromptLine)}, ${translate(connectingText)}`;
    } else {
      return translate(defaultText);
    }
  }

  // If we are enrolled in the experiment, append the instructions to fetch the parent.
  if (
    expChildModalType === ExpNewChildModal.newPrologueNoVisual ||
    expChildModalType === ExpNewChildModal.newPrologueVisual
  ) {
    return `${prologueReasonText}<br /><br />${translate(
      PrologueConstants.Description.PrologueFetchParentExperiment
    )}`;
  }

  return prologueReasonText;
}
