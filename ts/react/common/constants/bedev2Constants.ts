import { EnvironmentUrls } from 'Roblox';
import { UrlConfig } from 'core-utilities';

const { apiGatewayUrl } = EnvironmentUrls;

const url = {
  getOmniRecommendations: {
    url: `${apiGatewayUrl}/discovery-api/omni-recommendation`,
    withCredentials: true
  },
  getOmniRecommendationsMetadata: {
    url: `${apiGatewayUrl}/discovery-api/omni-recommendation-metadata`,
    withCredentials: true
  },
  getOmniSearch: {
    url: `${apiGatewayUrl}/search-api/omni-search`,
    withCredentials: true
  },
  getExploreSorts: {
    url: `${apiGatewayUrl}/explore-api/v1/get-sorts`,
    withCredentials: true
  },
  getExploreSortContents: {
    url: `${apiGatewayUrl}/explore-api/v1/get-sort-content`,
    withCredentials: true
  },
  getSearchLandingPage: {
    url: `${apiGatewayUrl}/search-api/search-landing-page`,
    withCredentials: true
  },
  getSurvey: (locationName: string): UrlConfig => ({
    url: `${apiGatewayUrl}/rocap/v1/locations/${locationName}/prompts`,
    withCredentials: true
  }),
  postSurveyResults: (locationName: string): UrlConfig => ({
    url: `${apiGatewayUrl}/rocap/v1/locations/${locationName}/annotations`,
    withCredentials: true
  }),
  getLandingPageData: (): UrlConfig => ({
    url: `${apiGatewayUrl}/landing-page-api/landing-page`,
    withCredentials: true
  })
};

export default {
  url
};
