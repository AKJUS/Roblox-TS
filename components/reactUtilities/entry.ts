import { addExternal } from "@rbx/externals";
import * as reactUtil from "@rbx/core-scripts/react";
import * as ReactUtilities from "@rbx/core-scripts/legacy/react-utilities";
import WebBloxProvider from "@rbx/core-scripts/react/webBloxProvider";

addExternal(["Roblox", "core-scripts", "react"], reactUtil);
addExternal(["Roblox", "core-scripts", "webBloxProvider"], WebBloxProvider);

addExternal("ReactUtilities", { ...ReactUtilities });
