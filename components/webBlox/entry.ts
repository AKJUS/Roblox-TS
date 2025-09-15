import { addExternal, addLegacyExternal } from "@rbx/externals";
// eslint-disable-next-line no-restricted-imports
import * as webBlox from "@rbx/ui";

addExternal(["Roblox", "ui"], webBlox);

addLegacyExternal("WebBlox", webBlox);
