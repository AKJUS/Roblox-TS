// Analytics constants for upsell banner tracking
export const UpsellEntrySurface = {
  Homepage: 'Homepage'
} as const;

export const UpsellStage = {
  Fae: 'fae'
} as const;

export const UpsellComponent = {
  Banner: 'Banner'
} as const;

export const UpsellPurpose = {
  FacialAgeEstimation: 'FacialAgeEstimation'
} as const;

export const UpsellEventType = {
  Shown: 'socialUpsellShown',
  ButtonClick: 'socialUpsellButtonClick'
} as const;
