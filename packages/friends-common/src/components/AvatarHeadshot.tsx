import { JSX } from "react";
import { AvatarCardItem } from "@rbx/core-ui";
import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import { Thumbnail2d, ThumbnailTypes, DefaultThumbnailSize } from "@rbx/thumbnails";
import Presence from "@rbx/presence";

const AvatarHeadshot = ({
  id,
  userProfileUrl,
  handleImageClick,
  translate,
}: {
  id: number;
  userProfileUrl: string;
  handleImageClick?: () => void;
  translate: TranslateFunction;
}): JSX.Element => {
  const thumbnail = (
    <Thumbnail2d
      type={ThumbnailTypes.avatarHeadshot}
      size={DefaultThumbnailSize}
      targetId={id}
      containerClass="avatar-card-image"
    />
  );
  return (
    <AvatarCardItem.Headshot
      statusIcon={<Presence.PresenceStatusIcon translate={translate} userId={id} />}
      thumbnail={thumbnail}
      imageLink={userProfileUrl}
      handleImageClick={handleImageClick}
    />
  );
};

export default AvatarHeadshot;
