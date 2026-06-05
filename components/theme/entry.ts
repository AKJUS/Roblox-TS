import { addExternal } from "@rbx/externals";
import * as theme from "@rbx/core-scripts/util/theme";

addExternal(["Roblox", "core-scripts", "util", "theme"], theme);

const userId = (): number | null => {
  const id = document.querySelector<HTMLMetaElement>('meta[name="user-data"]')?.dataset.userid;
  if (id == null) {
    return null;
  }
  const userId = Number.parseInt(id, 10);
  return Number.isNaN(userId) ? null : userId;
};

const defaultTheme = (): theme.Theme | undefined => {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="age-badge-control"]');
  return meta?.dataset.ageBadgeControl === "Kids" ? "dark" : undefined;
};

try {
  theme.initialize(userId() ?? -1, { defaultTheme: defaultTheme() });
} catch (e) {
  console.error(e);
}
