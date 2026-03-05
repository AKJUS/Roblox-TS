import { JSX } from "react";
import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import { PlusHeavyIcon, Badge } from "@rbx/ui";

const ADD_FRIENDS_URL = "/users/friends#!/friend-requests";
const ADD_CONNECTIONS_TRANSLATION_KEY = "Label.Connect";

const AddFriendsTile = ({
  translate,
  badgeCount,
}: {
  translate: TranslateFunction;
  badgeCount: number;
}): JSX.Element => (
  <div className="friends-carousel-tile">
    {/* TODO: old, migrated code */}
    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
    <button type="button" id="friend-tile-button">
      <a href={ADD_FRIENDS_URL}>
        <div className="add-friends-icon-container">
          {badgeCount > 0 && (
            <Badge
              className="friend-request-badge"
              overlap="rectangular"
              variant="standard"
              max={99}
              color="error"
              badgeContent={badgeCount.toString()}
            />
          )}
          <PlusHeavyIcon className="add-friends-icon" color="secondary" />
        </div>
        <div className="friends-carousel-tile-labels" data-testid="friends-carousel-tile-labels">
          <div className="friends-carousel-tile-label">
            <div className="friends-carousel-tile-name">
              <span className="friends-carousel-display-name">
                {translate(ADD_CONNECTIONS_TRANSLATION_KEY)}
              </span>
            </div>
          </div>
        </div>
      </a>
    </button>
  </div>
);
export default AddFriendsTile;
