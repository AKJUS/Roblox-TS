import { setTheme, rawThemeOverride } from "@rbx/core-scripts/util/theme";

export default () => {
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const theme = rawThemeOverride();
  switch (theme) {
    case "system":
    case "light":
    case "dark":
      setTheme(theme);
      break;
    case "none":
    case undefined:
      // Cookie is absent or explicitly unset
      break;
    default:
      // eslint-disable-next-line no-console
      console.warn(`Unknown theme override: ${theme}`);
      break;
  }
};
