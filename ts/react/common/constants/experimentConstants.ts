import { EnvironmentUrls } from 'Roblox';

const { apiGatewayUrl } = EnvironmentUrls;

const url = {
  getExperimentationValues: (
    projectId: number,
    layerName: string,
    values: string[]
  ): { url: string; withCredentials: boolean } => ({
    url: `${apiGatewayUrl}/product-experimentation-platform/v1/projects/${projectId}/layers/${layerName}/values?parameters=${values.join(
      ','
    )}`,
    withCredentials: true
  })
};

const layerNames = {
  homePage: 'PlayerApp.HomePage.UX',
  homePageWeb: 'Website.Homepage',
  gridUi: 'PlayerApp.GridUI',
  serverTab: 'GameDetails.ServersTab',
  gameDetails: 'Website.GameDetails',
  gameDetailsExposure: 'Website.GameDetails.Exposure',
  searchPage: 'Website.SearchResultsPage',
  discoverPage: 'Website.GamesPage',
  tileLayer: 'Website.TileLayer',
  playButton: 'Website.PlayButton'
};

const defaultValues = {
  homePage: {},
  homePageWeb: {},
  gridUi: {},
  serverTab: {},
  gameDetails: {
    ShouldHidePrivateServersInAboutTab: false,
    IsGameStorePreviewEnabled: false,
    HasUpdatedRecommendedSortTitle: true,
    IsGamePreviewVideoEnabled: false
  },
  gameDetailsExposure: {},
  searchPage: {},
  discoverPage: {
    // MUS-2078 TODO: Remove this and all other FE experimentation logic for the
    // Music surfaces
    IsMusicChartsCarouselEnabled: false
  },
  tileLayer: {},
  playButton: {}
};

export default {
  url,
  defaultValues,
  layerNames
};
