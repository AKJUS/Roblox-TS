import React, { useCallback, useMemo } from 'react';
import type { TTailwindIconClass } from '@rbx/foundation-tailwind/classes';
import UpsellBannerContentsCompact from './UpsellBannerContentsCompact';
import { TAnalyticsProps, TBadgeProps, TButtonProps } from '../types/upsellCardTypes';
import UpsellBannerContentsFull from './UpsellBannerContentsFull';
import isCompactUpsellBannerConfig from '../utils/isCompactUpsellBannerConfig';
import useUpsellAnalytics from '../hooks/useUpsellAnalytics';

interface TUpsellBannerProps {
  badgePropsArray: TBadgeProps[];
  titleText: string;
  bodyText?: string;
  iconClassName?: TTailwindIconClass;
  dismissible: boolean;
  onDismiss: () => void;
  buttonPropsArray: TButtonProps[];
  analyticsConfig?: TAnalyticsProps;
}

const UpsellBanner: React.FC<TUpsellBannerProps> = ({
  badgePropsArray,
  titleText,
  bodyText,
  iconClassName,
  dismissible,
  buttonPropsArray,
  onDismiss,
  analyticsConfig
}) => {
  // Use custom hook to manage all analytics logic
  const { logDismissed, logButtonClick } = useUpsellAnalytics(analyticsConfig);

  const handleDismiss = useCallback(() => {
    logDismissed();
    onDismiss();
  }, [logDismissed, onDismiss]);

  const createButtonClickHandler = useCallback(
    (originalOnClick: () => void, buttonVariant: string) => {
      return () => {
        logButtonClick(buttonVariant);
        originalOnClick();
      };
    },
    [logButtonClick]
  );

  const buttonPropsArrayWithTelemetry = useMemo(
    () =>
      buttonPropsArray.map((buttonProps: TButtonProps) => ({
        ...buttonProps,
        onClick: createButtonClickHandler(buttonProps.onClick, buttonProps.variant)
      })),
    [buttonPropsArray, createButtonClickHandler]
  );

  const shouldShowCompactBanner = isCompactUpsellBannerConfig({
    badgePropsArray,
    buttonPropsArray,
    dismissible,
    bodyText
  });

  return (
    <div className='flex margin-bottom-medium'>
      <div className='flex grow-1 radius-medium padding-large stroke-standard stroke-default bg-shift-100'>
        {shouldShowCompactBanner ? (
          <UpsellBannerContentsCompact
            buttonProps={buttonPropsArrayWithTelemetry[0]}
            titleText={titleText}
            iconClassName={iconClassName}
          />
        ) : (
          <UpsellBannerContentsFull
            badgePropsArray={badgePropsArray}
            titleText={titleText}
            bodyText={bodyText}
            iconClassName={iconClassName}
            dismissible={dismissible}
            onDismiss={handleDismiss}
            buttonPropsArray={buttonPropsArrayWithTelemetry}
          />
        )}
      </div>
    </div>
  );
};

export default UpsellBanner;
