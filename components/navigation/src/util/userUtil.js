import { DisplayNames } from "@rbx/core-scripts/legacy/Roblox";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { concatTexts } from "@rbx/core-scripts/legacy/core-utilities";

const { name, displayName } = authenticatedUser;
const getNameForDisplay = () => (DisplayNames?.Enabled() ? displayName : name);

const getUserNameForHeader = () =>
  DisplayNames?.Enabled() ? concatTexts.concat(["", name]) : name;

export default {
  nameForDisplay: getNameForDisplay(),
  nameForHeader: getUserNameForHeader(),
};
