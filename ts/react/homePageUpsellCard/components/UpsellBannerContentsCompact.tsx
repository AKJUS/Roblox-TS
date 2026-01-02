import React from 'react';
import { Button, Icon } from '@rbx/foundation-ui';
import type { TTailwindIconClass } from '@rbx/foundation-tailwind/classes';
import { TButtonProps } from '../types/upsellCardTypes';

interface TUpsellBannerContentsCompactProps {
  iconClassName?: TTailwindIconClass;
  buttonProps?: TButtonProps;
  titleText: string;
}

const UpsellBannerContentsCompact: React.FC<TUpsellBannerContentsCompactProps> = ({
  buttonProps,
  titleText,
  iconClassName
}) => {
  return (
    <div className='flex flex-row grow-1 gap-medium items-center'>
      {iconClassName && (
        <div className='flex shrink-0'>
          <Icon size='Large' name={iconClassName} />
        </div>
      )}
      <div className='text-title-medium grow-1'>{titleText}</div>
      {buttonProps && (
        <Button
          onClick={buttonProps.onClick}
          variant={buttonProps.variant}
          size='Small'
          aria-label={buttonProps.text}
          className='shrink-0'>
          {buttonProps.text}
        </Button>
      )}
    </div>
  );
};

export default UpsellBannerContentsCompact;
