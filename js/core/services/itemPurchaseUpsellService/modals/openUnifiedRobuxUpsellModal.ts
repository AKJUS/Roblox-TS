import { RobloxIntlInstance } from 'Roblox';
import React from 'react';
import ReactDOM from 'react-dom';
import { withTranslations } from 'react-utilities';
import UnifiedRobuxUpsellModal, {
  UnifiedRobuxUpsellModalProps
} from '../../../../../ts/react/components/UnifiedRobuxUpsellModal';
import UnifiedRobuxUpsellTooExpensiveModal, {
  UnifiedRobuxUpsellTooExpensiveModalProps
} from '../../../../../ts/react/components/UnifiedRobuxUpsellTooExpensiveModal';
import translationConfig from '../../../../react/itemPurchase/translation.config';
import { UpsellProduct } from '../constants/serviceTypeDefinitions';

export type UnifiedRobuxUpsellVariant = 'standard' | 'tooExpensive';

type BaseProps = {
  onAccept?: () => void | boolean;
  onCancel?: () => void | boolean;
  expectedPrice: number;
  thumbnail: React.ReactNode;
  assetName: string;
  currentRobuxBalance?: number;
};

export type OpenUnifiedRobuxUpsellProps =
  | ({
      variant?: 'standard';
      assetType: string;
      assetTypeDisplayName?: string;
      upsellProduct: UpsellProduct;
      intl: RobloxIntlInstance;
    } & BaseProps)
  | ({
      variant: 'tooExpensive';
    } & BaseProps);

export function openUnifiedRobuxUpsellModal(props: OpenUnifiedRobuxUpsellProps) {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const close = () => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
    props.onCancel?.();
  };

  const handleAccept = () => {
    const result = props.onAccept?.();
    if (result !== false) {
      close();
    }
  };

  if (props.variant === 'tooExpensive') {
    const TranslatedTooExpensiveModal = withTranslations(
      UnifiedRobuxUpsellTooExpensiveModal,
      translationConfig.purchasingResources
    );

    const element = React.createElement(TranslatedTooExpensiveModal, {
      expectedPrice: props.expectedPrice,
      thumbnail: props.thumbnail,
      assetName: props.assetName,
      onAction: handleAccept,
      onCancel: close,
      open: true,
      loading: false,
      currentRobuxBalance: props.currentRobuxBalance
    } as UnifiedRobuxUpsellTooExpensiveModalProps);

    ReactDOM.render(element, container);
    return { close };
  }

  // Default: standard variant
  const TranslatedStandardModal = withTranslations(
    UnifiedRobuxUpsellModal,
    translationConfig.purchasingResources
  );

  const element = React.createElement(TranslatedStandardModal, {
    expectedPrice: props.expectedPrice,
    thumbnail: props.thumbnail,
    assetName: props.assetName,
    assetType: props.assetType,
    assetTypeDisplayName: props.assetTypeDisplayName,
    onAction: handleAccept,
    onCancel: close,
    open: true,
    loading: false,
    currentRobuxBalance: props.currentRobuxBalance,
    robuxPackageAmount: props.upsellProduct?.robux_amount,
    robuxPackagePrice: props.upsellProduct?.price
  } as UnifiedRobuxUpsellModalProps);

  ReactDOM.render(element, container);
  return { close };
}

export default openUnifiedRobuxUpsellModal;
