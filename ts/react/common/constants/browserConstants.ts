// Container IDs
export const homePageContainerId = 'place-list';
export const homePageContainer = (): HTMLElement | null =>
  document.getElementById(homePageContainerId);
export const placesListContainerId = 'places-list-web-app';
export const placesListContainer = (): HTMLElement | null =>
  document.getElementById(placesListContainerId);
export const navigationContainerId = 'navigation-container';
export const navigationContainer = (): HTMLElement | null =>
  document.getElementById(navigationContainerId);
export const gameStoreContainerId = 'game-store-container';
export const gameStoreContainer = (): HTMLElement | null =>
  document.getElementById(gameStoreContainerId);
export const gameStorePreviewContainerId = 'game-details-about-store-preview';
export const gameStorePreviewContainer = (): HTMLElement | null =>
  document.getElementById(gameStorePreviewContainerId);

// URL Params
export const queryParams = {
  keyword: 'keyword'
};

// URL Paths
export const url = {
  sortDetail: (sortName: string): string => `charts#/sortName/${sortName}`,
  sortDetailV2: (sortName: string): string => `charts#/sortName/v2/${sortName}`
};
