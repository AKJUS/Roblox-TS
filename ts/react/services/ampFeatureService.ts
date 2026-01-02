import { EnvironmentUrls } from 'Roblox';
import { httpService } from 'core-utilities';

export default function ampFeatureService() {
  const DMCCALegalTextFeature = 'ShouldUseDMCCALegalDisclosure';
  const { apiGatewayUrl } = EnvironmentUrls;
  const getAmpUpsellUrlConfig = (featureName: string) => ({
    retryable: true,
    withCredentials: true,
    url: `${apiGatewayUrl}/access-management/v1/upsell-feature-access?featureName=${featureName}`
  });

  return {
    getDmccaLegalTextFeature: () => {
      return httpService.get(getAmpUpsellUrlConfig(DMCCALegalTextFeature)).then(({ data }) => {
        return (data as { access: string }).access === 'Granted';
      });
    }
  };
}
