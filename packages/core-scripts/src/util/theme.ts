const extractCookie = (key: string): string | undefined =>
  document.cookie
    .split("; ")
    .find(row => row.startsWith(`${key}=`))
    ?.split("=")[1];

export const themeOverride = (): string | undefined =>
  extractCookie("RBXHideThemeSetting") === "True"
    ? (extractCookie("RBXThemeOverride") ?? "True")
    : undefined;

/** @deprecated Only necessary while IXP is active */
export const rawThemeOverride = (): string | undefined => extractCookie("RBXThemeOverride");

const { classList } = document.body;

const prefersDarkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

const setLightTheme = () => {
  classList.add("light-theme");
  classList.remove("dark-theme");
};

const setDarkTheme = () => {
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

export type Theme = "light" | "dark" | "system";

let currentTheme: Theme = "system";

export const getTheme = (): Theme => currentTheme;

export const setTheme = (theme: Theme): void => {
  currentTheme = theme;
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
