import { Direction } from "./directional-navigation/types";

const VIEWPORT_INNER_ZONE_RATIO = 0.8; // Inner 80% of viewport

interface ViewportZone {
  inView: boolean;
  inInnerZone: boolean;
  distanceFromViewport: number; // 0 if in view, positive if below/right, negative if above/left
}

export function getElementViewportInfo(rect: DOMRect, direction: Direction): ViewportZone {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Calculate inner zone boundaries (center 80%)
  const horizontalMargin = (viewportWidth * (1 - VIEWPORT_INNER_ZONE_RATIO)) / 2;
  const verticalMargin = (viewportHeight * (1 - VIEWPORT_INNER_ZONE_RATIO)) / 2;

  const innerLeft = horizontalMargin;
  const innerRight = viewportWidth - horizontalMargin;
  const innerTop = verticalMargin;
  const innerBottom = viewportHeight - verticalMargin;

  // Check if element is in viewport
  const inView =
    rect.right >= 0 && rect.left <= viewportWidth && rect.bottom >= 0 && rect.top <= viewportHeight;

  // Check if element is in inner zone
  const inInnerZone =
    inView &&
    rect.left >= innerLeft &&
    rect.right <= innerRight &&
    rect.top >= innerTop &&
    rect.bottom <= innerBottom;

  // Calculate distance from viewport edge
  let distanceFromViewport = 0;
  if (!inView) {
    switch (direction) {
      case "up":
        distanceFromViewport = rect.bottom < 0 ? rect.bottom : 0;
        break;
      case "down":
        distanceFromViewport = rect.top > viewportHeight ? rect.top - viewportHeight : 0;
        break;
      case "left":
        distanceFromViewport = rect.right < 0 ? rect.right : 0;
        break;
      case "right":
        distanceFromViewport = rect.left > viewportWidth ? rect.left - viewportWidth : 0;
        break;
    }
  }

  return { inView, inInnerZone, distanceFromViewport };
}
