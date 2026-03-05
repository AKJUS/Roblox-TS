import environmentUrls from "@rbx/environment-urls";
import { UrlConfig } from "@rbx/core-scripts/http";

const { apiGatewayUrl } = environmentUrls;

const url = {
  getOmniRecommendations: {
    url: `${apiGatewayUrl}/discovery-api/omni-recommendation`,
    withCredentials: true,
  },
  getOmniRecommendationsMetadata: {
    url: `${apiGatewayUrl}/discovery-api/omni-recommendation-metadata`,
    withCredentials: true,
  },
  getOmniSearch: {
    url: `${apiGatewayUrl}/search-api/omni-search`,
    withCredentials: true,
  },
  getExploreSorts: {
    url: `${apiGatewayUrl}/explore-api/v1/get-sorts`,
    withCredentials: true,
  },
  getExploreSortContents: {
    url: `${apiGatewayUrl}/explore-api/v1/get-sort-content`,
    withCredentials: true,
  },
  getSearchLandingPage: {
    url: `${apiGatewayUrl}/search-api/search-landing-page`,
    withCredentials: true,
  },
  getSearchLandingPageV2: {
    url: `${apiGatewayUrl}/search-landing-page-api/v1`,
    withCredentials: true,
  },
  getSurvey: (locationName: string): UrlConfig => ({
    url: `${apiGatewayUrl}/rocap/v1/locations/${locationName}/prompts`,
    withCredentials: true,
  }),
  postSurveyResults: (locationName: string): UrlConfig => ({
    url: `${apiGatewayUrl}/rocap/v1/locations/${locationName}/annotations`,
    withCredentials: true,
  }),
  getLandingPageData: (): UrlConfig => ({
    url: `${apiGatewayUrl}/landing-page-api/landing-page`,
    withCredentials: true,
  }),
  postUserSignal: (): UrlConfig => ({
    url: `${apiGatewayUrl}/user-signal-http-gateway/v1/user-signal/ingest`,
    withCredentials: true,
  }),
};

export default {
  url,
};
