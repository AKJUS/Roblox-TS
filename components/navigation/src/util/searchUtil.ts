/* eslint-disable @typescript-eslint/switch-exhaustiveness-check */
import { TranslationResourceProvider } from "@rbx/core-scripts/legacy/Roblox";
import links from "../constants/linkConstants";
import searchConstants from "../constants/searchConstants";
import { GamesAutocompleteSuggestionEntryType } from "../services/searchService";

interface Suggestion {
  label?: string;
  type?: GamesAutocompleteSuggestionEntryType;
  Query?: string;
  url?: string;
  searchQuery?: string;
}

const isAutocompleteSuggestion = (suggestion: Suggestion) => suggestion.label === undefined;
const isAvatarAutocompleteSuggestion = (suggestion: Suggestion) => suggestion.Query !== undefined;
const isKeywordSuggestion = (suggestion: Suggestion) =>
  isAutocompleteSuggestion(suggestion) &&
  suggestion.type === GamesAutocompleteSuggestionEntryType.QuerySuggestion;
const isGameSuggestion = (suggestion: Suggestion) =>
  isAutocompleteSuggestion(suggestion) &&
  suggestion.type === GamesAutocompleteSuggestionEntryType.GameSuggestion;

const getAutocompleteSearchType = (suggestion: Suggestion) => {
  if (isAvatarAutocompleteSuggestion(suggestion)) {
    return "avatar";
  }
  switch (suggestion.type) {
    case GamesAutocompleteSuggestionEntryType.QuerySuggestion: {
      return "keyword";
    }
    case GamesAutocompleteSuggestionEntryType.GameSuggestion: {
      return "game";
    }
    default: {
      throw Error(`Unrecognized autocomplete suggestion, ${JSON.stringify(suggestion)}`);
    }
  }
};

const getDefaultSearchType = (suggestion: Suggestion) => {
  switch (suggestion.label) {
    case "Label.Players": {
      return "defaultPlayers";
    }
    case "Heading.Marketplace":
    case "Label.AvatarShop":
    case "Label.sCatalog": {
      return "defaultShops";
    }
    case "Label.sGroups": {
      return "defaultGroups";
    }
    case "Label.CreatorStore": {
      return "defaultLibrary";
    }
    case "Label.Games": {
      return "defaultGames";
    }
    default: {
      throw Error(`Unrecognized default suggestion, ${JSON.stringify(suggestion)}`);
    }
  }
};

const getSuggestionUrl = (
  suggestion: Suggestion,
  event: React.ChangeEvent<HTMLInputElement> | undefined,
) => {
  if (isAutocompleteSuggestion(suggestion) && isAvatarAutocompleteSuggestion(suggestion)) {
    return links.avatarSearchLink.url + encodeURIComponent(suggestion.Query ?? "");
  }
  if (isAutocompleteSuggestion(suggestion)) {
    return links.gameSearchLink.url + encodeURIComponent(suggestion.searchQuery ?? "");
  }
  if (event?.target.value) {
    return (suggestion.url ?? "") + encodeURIComponent(event.target.value);
  }

  return "";
};

const getAvatarAutocompleteLanguageCode = () => {
  const translationProvider = new TranslationResourceProvider();
  let locale = translationProvider.intl.getLocale();
  const regionChar = locale.indexOf("-");
  locale = locale.substring(0, regionChar !== -1 ? regionChar : locale.length);
  if (locale !== searchConstants.englishLanguageCode) {
    locale += `,${searchConstants.englishLanguageCode}`;
  }
  return locale;
};

const serializeSuggestions = (suggestions: Suggestion[], searchInput: string) =>
  suggestions
    .map(suggestion => {
      if (isAutocompleteSuggestion(suggestion)) {
        return `${getAutocompleteSearchType(suggestion)}|${suggestion.searchQuery}`;
      }
      return `${getDefaultSearchType(suggestion)}|${searchInput}`;
    })
    .join(",");

export default {
  isAutocompleteSuggestion,
  isAvatarAutocompleteSuggestion,
  isGameSuggestion,
  isKeywordSuggestion,
  getAutocompleteSearchType,
  getDefaultSearchType,
  getSuggestionUrl,
  getAvatarAutocompleteLanguageCode,
  serializeSuggestions,
};
