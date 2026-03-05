import React, { useState, useRef, useEffect } from "react";

const DROPDOWN_EDGE_PADDING = 24;

interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  dropdownWidth: number;
}

const FriendTilePopover: React.FC<PopoverProps> = ({ trigger, content, dropdownWidth }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleMouseOver = () => {
    setIsOpen(true);
  };

  const handleMouseOut = (
    event: React.FocusEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement> | MouseEvent | null,
  ) => {
    if (
      event != null &&
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      !triggerRef.current?.contains(event.relatedTarget as Node) &&
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      !popoverRef.current?.contains(event.relatedTarget as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (triggerRef.current) {
      triggerRef.current.addEventListener("mouseover", handleMouseOver);
      triggerRef.current.addEventListener("mouseout", handleMouseOut);

      return () => {
        // TODO: old, migrated code FIXME THIS IS A BUG
        triggerRef.current?.removeEventListener("mouseover", handleMouseOver);
        // TODO: old, migrated code FIXME THIS IS A BUG
        // eslint-disable-next-line react-hooks/exhaustive-deps
        triggerRef.current?.removeEventListener("mouseout", handleMouseOut);
      };
    }
    return () => {
      /* Do nothing if no trigger ref */
    };
  }, []);

  const getPopoverLeftValue = () => {
    const triggerLeft = triggerRef.current?.offsetLeft ?? 0;
    const triggerWidth = triggerRef.current?.offsetWidth ?? 0;
    const left = triggerLeft + triggerWidth / 2 - dropdownWidth / 2;

    // If dropdown would overflow left edge, position on left edge
    if (left < 0) {
      return DROPDOWN_EDGE_PADDING;
    }

    // If dropdown would overflow right edge, position on right edge
    if (left + dropdownWidth > window.innerWidth) {
      return window.innerWidth - (dropdownWidth + DROPDOWN_EDGE_PADDING);
    }

    return left;
  };

  return (
    <div>
      <div ref={triggerRef}>{trigger}</div>
      {isOpen && (
        <div
          ref={popoverRef}
          style={{
            position: "absolute",
            top: (triggerRef.current?.offsetHeight ?? 0) + (triggerRef.current?.offsetTop ?? 0),
            left: getPopoverLeftValue(),
            zIndex: 1002,
            width: dropdownWidth,
          }}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
          onFocus={handleMouseOver}
          onBlur={handleMouseOut}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default FriendTilePopover;
