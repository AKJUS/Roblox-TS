import { addExternal } from "@rbx/externals";
import * as theme from "@rbx/core-scripts/util/theme";
import init from "./src";

addExternal(["Roblox", "core-scripts", "util", "theme"], theme);

init();
