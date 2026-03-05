import { DisplayNames } from "@rbx/core-scripts/legacy/Roblox";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";

const { name, displayName } = authenticatedUser;
const getNameForDisplay = () => (DisplayNames?.Enabled() ? displayName : name);

export default {
  nameForDisplay: getNameForDisplay(),
};
