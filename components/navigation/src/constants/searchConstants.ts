import environmentUrls from '@rbx/environment-urls';
import linkConstants from './linkConstants';

export const getNavigationContainer = () => document.getElementById('navigation-container');
export default {
  debounceTimeout: 100,
  debouncedSearchInputMaxLength: 35,
  expiryTimeout: 5000,
  variationId: 1,
  trendingVariationId: 0,
  avatarAutocompleteQueryPaddingAmount: 10,
  requestSuggestionUrl: {
    url: `${environmentUrls.apiGatewayUrl}/games-autocomplete/v1/request-suggestion`,
    withCredentials: true
  },
  getSuggestionUrl: {
    url: `${environmentUrls.apiGatewayUrl}/games-autocomplete/v1/get-suggestion/`,
    withCredentials: true
  },
  avatarRequestSuggestionUrl: {
    url: `${environmentUrls.apiGatewayUrl}/autocomplete-avatar/v2/suggest`,
    withCredentials: true
  },
  avatarRequestSuggestionCdnUrl: {
    url: `${environmentUrls.apiGatewayCdnUrl}/autocomplete-avatar/v2/suggest`,
    withCredentials: true
  },
  englishLanguageCode: 'en',
  avatarAutocompleteUrlLocations: ['Catalog', 'Trades', 'Inventory', 'Avatar', 'CatalogItem'],
  avatarAutocompleteSuggestionLimit: 5,
  isSpecialTreatmentAutocompleteRestricted: (): boolean =>
    parseInt(getNavigationContainer()?.dataset.numberOfAutocompleteSuggestions ?? '', 10) === 7 &&
    linkConstants.miscSearchLink
      .reduce<string[]>((acc, link) => {
        acc.push(...link.pageSort);
        return acc;
      }, [])
      .reduce((r, keyword) => r || window.location.pathname.includes(keyword), false),
  isSpecialTreatment: (): boolean =>
    parseInt(getNavigationContainer()?.dataset.numberOfAutocompleteSuggestions ?? '', 10) === 7,
  numberOfSpecialTreatmentAutocompleteSuggestions: 3,
  isAutocompleteSuggestionsIXPTestEnabled: (): boolean =>
    parseInt(getNavigationContainer()?.dataset.numberOfAutocompleteSuggestions ?? '', 10) > 0,
  numberOfAutocompleteSuggestions: (): number =>
    parseInt(getNavigationContainer()?.dataset.numberOfAutocompleteSuggestions ?? '', 10) || 0
};
