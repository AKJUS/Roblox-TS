// Do not import anything here without checking if you need to update the rspack config for the theme component.

import { arrayIncludes } from "@rbx/core-types";
import { getCookie } from "../cookie";

export const themes = ["light", "dark", "system"] as const;
export type Theme = (typeof themes)[number];

// [user id, theme index, flags?] — flags is optional for entries written before it existed.
type ThemeEntry = [number, number] | [number, number, number];
type ThemeData = ThemeEntry[];

type LocalStorageData = { version: 0; data: ThemeData } | { version: 1; data: unknown };

const maxUsers = 100;

export const FLAG_DEFAULT_APPLIED = 1 << 0;

let userId = -1;
let currentTheme: Theme | undefined;

const prefersDarkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

const setLightTheme = () => {
  const { classList } = document.body;
  classList.add("light-theme");
  classList.remove("dark-theme");
};

const setDarkTheme = () => {
  const { classList } = document.body;
  classList.add("dark-theme");
  classList.remove("light-theme");
};

const updateTheme = (dark: boolean) => {
  if (dark) {
    setDarkTheme();
  } else {
    setLightTheme();
  }
};

const themeEventListener = (e: MediaQueryListEvent) => {
  updateTheme(e.matches);
};

const setThemeWithoutLocalStorage = (theme: Theme): void => {
  currentTheme = theme;
  const { classList } = document.body;
  switch (theme) {
    case "system":
      classList.add("system-theme");
      updateTheme(prefersDarkMediaQuery.matches);
      prefersDarkMediaQuery.addEventListener("change", themeEventListener);
      break;
    case "light":
      prefersDarkMediaQuery.removeEventListener("change", themeEventListener);
      setLightTheme();
      classList.remove("system-theme");
      break;
    case "dark":
      prefersDarkMediaQuery.removeEventListener("change", themeEventListener);
      setDarkTheme();
      classList.remove("system-theme");
      break;
  }
};

const getThemeData = (): ThemeData | null | undefined => {
  try {
    const json = localStorage.getItem("theme");
    if (json == null) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const { version, data } = JSON.parse(json) as LocalStorageData;
    // If version is not 0, then another tab is probably on a more up-to-date version.
    // Let's use the default theme for this tab and do not write to local storage.
    return version === 0 ? data : undefined;
  } catch (e) {
    console.error(`Failed to get theme data: ${e instanceof Error ? e : String(e)}`);
    // Most likely failed to parse theme data. New versions should still follow the same schema and
    // succeed parsing. If we failed here, the data is likely corrupted. Reset to the default value.
    return null;
  }
};

const findUserEntry = (themeData: ThemeData): ThemeEntry | undefined =>
  themeData.find(([id]) => id === userId);

const getUserFlags = (themeData: ThemeData): number => findUserEntry(themeData)?.[2] ?? 0;

const getUserTheme = (themeData: ThemeData): Theme | null | undefined => {
  const entry = findUserEntry(themeData);
  const themeIndex = entry?.[1];
  return themeIndex == null ? null : themes[themeIndex];
};

// Note: last write to local storage wins which should suffice.
const setThemeWithLocalStorage = (theme: Theme, extraFlags = 0): void => {
  setThemeWithoutLocalStorage(theme);

  const themeData = getThemeData();
  if (themeData === undefined) {
    return;
  }
  const existingFlags = themeData == null ? 0 : getUserFlags(themeData);
  const newThemeData = themeData?.filter(([id]) => id !== userId) ?? [];
  if (newThemeData.length >= maxUsers) {
    newThemeData.shift();
  }
  const flags = existingFlags | extraFlags;
  newThemeData.push(
    flags === 0 ? [userId, themes.indexOf(theme)] : [userId, themes.indexOf(theme), flags],
  );
  try {
    const localStorageData: LocalStorageData = { version: 0, data: newThemeData };
    localStorage.setItem("theme", JSON.stringify(localStorageData));
  } catch (e) {
    console.error(
      `Could not set theme. Local storage is likely full: ${e instanceof Error ? e : String(e)}`,
    );
  }
};

const storageEventListener = ({ key, newValue }: StorageEvent) => {
  // If `newValue == null`, then localstorage was cleared, presumably because the user cleared
  // their browser state. In that case, do nothing and wait for a tab reload or new tab load.
  // That new tab will set the new theme and the other tabs will receive the updated theme
  // from another storage event.
  if (key === "theme" && newValue != null) {
    const themeData = getThemeData();
    // If `themeData === undefined`, then a new data version is being used and a page reload is needed.
    // If `themeData === null`, then our data got deleted or is corrupted. A page reload is needed to reset.
    // In the mean time, we will keep this tab on the old, out of sync theme.
    if (themeData == null) {
      return;
    }
    const theme = getUserTheme(themeData);
    // If `theme === undefined`, then we might have added a new theme and a page reload is
    // needed for the new styles to be loaded on this tab. In the mean time, we will keep this
    // tab on the old, out of sync theme.
    //
    // Additionally, if `theme === null` then that means the data for our user was somehow
    // deleted (e.g., we hit the `maxUsers` limit). Let's not do anything in this case either.
    if (theme == null) {
      return;
    }
    setThemeWithoutLocalStorage(theme);
  }
};

// If the `RBXThemeOverride` cookie is provided, we disable reading and writing from local storage
// as well the ability to change theme. Currently used for webviews.
const initializeUsingOverride = (theme: string) => {
  switch (theme) {
    case "system":
    case "light":
    case "dark":
      setThemeWithoutLocalStorage(theme);
      break;
    case "none":
    case "": {
      setThemeWithoutLocalStorage("system");
      break;
    }
    default:
      console.warn(`Unknown theme: ${theme}`);
      setThemeWithoutLocalStorage("system");
      break;
  }
};

export type InitializeOptions = {
  defaultTheme?: Theme;
};

export const initialize = (currentUserId: number, options: InitializeOptions = {}): void => {
  const override = getCookie("RBXThemeOverride");
  if (override != null) {
    initializeUsingOverride(override);
    return;
  }

  const pageName =
    document.querySelector<HTMLMetaElement>('meta[name="page-meta"]')?.dataset.internalPageName;
  const route = new URL(window.location.href).pathname;
  if (
    arrayIncludes(
      [
        "Login",
        "CreateAccount",
        "Landing",
        "MobileAppCreateAccount",
        "MobileAppLanding",
        "DownloadV2",
        "ForgotCredentials",
        "SecurityNotification",
        "SupportedBrowsers",
        "ShopGiftCards",
      ],
      pageName,
    ) ||
    [/^\/([^/]+\/)?spotlight\/[^/]+\/?$/i].some(r => r.test(route))
  ) {
    // Temporary fix, some routes force dark theme.
    return;
  }

  userId = currentUserId;

  const themeData = getThemeData();
  const theme = themeData == null ? themeData : getUserTheme(themeData);

  // Apply `defaultTheme` once per (user, browser), tracked via FLAG_DEFAULT_APPLIED.
  // This intentionally takes precedence over any server-rendered body-class theme:
  // e.g. kids pages render light by default, but we want to flip them to dark on
  // first visit. Subsequent visits fall through to the normal localStorage path.
  if (options.defaultTheme != null && themeData !== undefined) {
    const userFlags = themeData == null ? 0 : getUserFlags(themeData);
    if ((userFlags & FLAG_DEFAULT_APPLIED) === 0) {
      setThemeWithLocalStorage(options.defaultTheme, FLAG_DEFAULT_APPLIED);
      window.addEventListener("storage", storageEventListener);
      return;
    }
  }

  if (theme === null) {
    const { classList } = document.body;
    if (classList.contains("system-theme")) {
      setThemeWithLocalStorage("system");
    } else if (classList.contains("light-theme")) {
      setThemeWithLocalStorage("light");
    } else if (classList.contains("dark-theme")) {
      setThemeWithLocalStorage("dark");
    } else {
      setThemeWithLocalStorage("system");
    }
  } else if (theme === undefined) {
    // We encountered either:
    // - A new data version in local storage. A page reload is needed to get the new logic.
    // - An unexpected theme in local storage. We might have added a new theme and a page reload is
    //   needed to get the new styles and logic.
    // Let's default to system theme.
    setThemeWithoutLocalStorage("system");
  } else {
    setThemeWithoutLocalStorage(theme);
  }

  window.addEventListener("storage", storageEventListener);
};

/** @deprecated For IXP only */
export const isSystemThemeEnabled = (): boolean => true;

/** @deprecated For IXP only */
export const themeOverride = (): string | null => "True";

export const getTheme = (): Theme => currentTheme ?? "system";

export const setTheme = (theme: Theme): void => {
  if (!arrayIncludes(themes, theme)) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.warn(`Unknown theme: ${theme}`);
    return;
  }
  if (theme === currentTheme) {
    return;
  }
  setThemeWithLocalStorage(theme);
};

/** @deprecated For testing only, unstable interface. */
export const resetData = (): void => {
  currentTheme = undefined;
  userId = -1;
};
