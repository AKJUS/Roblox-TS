import type { NormalizedDiscountLine } from '../components/discountInformation';

const PLUS_BENEFIT_DISCOUNT_CAMPAIGN = 'BlackbirdSubscription';
const ROBLOX_PLUS_SUBSCRIPTION_CAMPAIGN = 'RobloxPlusSubscription';
const ROBLOX_SUBSCRIPTION_CAMPAIGN = 'RobloxSubscription';

export default function isPlusBenefitDiscount(
  discounts?: NormalizedDiscountLine[] | null
): boolean {
  return !!discounts?.some(
    d =>
      d.discountCampaign === PLUS_BENEFIT_DISCOUNT_CAMPAIGN ||
      d.discountCampaign === ROBLOX_PLUS_SUBSCRIPTION_CAMPAIGN ||
      d.discountCampaign === ROBLOX_SUBSCRIPTION_CAMPAIGN
  );
}
