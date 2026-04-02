import React from 'react';
import { withTranslations, TranslateFunction } from 'react-utilities';
import { numberFormat } from 'core-utilities';
import itemPurchaseConstants from '../../../js/react/itemPurchase/constants/itemPurchaseConstants';
import translationConfig from '../../../js/react/itemPurchase/translation.config';

const { resources } = itemPurchaseConstants;

export type UnifiedPriceLabelProps = {
  translate: TranslateFunction;
  price: number;
  color?: string;
  useFreeText?: boolean;
};

function UnifiedPriceLabel({
  translate,
  price,
  color = '',
  useFreeText = true
}: UnifiedPriceLabelProps) {
  if (price === 0 && useFreeText) {
    return <span className='text-robux text-free'>{translate(resources.freeLabel)}</span>;
  }
  return (
    <React.Fragment>
      <span className={`icon-robux${color ? `-${color}` : ''}-16x16`} />
      <span className='text-robux ml-1 text-body-medium'>
        {numberFormat.getNumberFormat(price)}
      </span>
    </React.Fragment>
  );
}

export default withTranslations(UnifiedPriceLabel, translationConfig.purchasingResources);
