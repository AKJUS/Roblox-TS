import React from 'react';
import { withTranslations, TranslateFunction } from 'react-utilities';
import { renderToString } from 'react-dom/server';
import { escapeHtml } from 'core-utilities';
import translationConfig from '../translation.config';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import PriceLabel from '../components/PriceLabel';
import AssetName from '../components/AssetName';
import UnifiedPurchaseModal from '../../../../ts/react/components/UnifiedPurchaseModal';

const { resources } = itemPurchaseConstants;

export interface UnifiedPurchaseVerificationModalProps {
  translate: TranslateFunction;
  title?: string;
  expectedPrice: number;
  thumbnail: React.ReactNode;
  assetName: string;
  assetType: string;
  assetTypeDisplayName?: string;
  sellerName: string;
  isPlace?: boolean;
  onAction: () => void;
  loading?: boolean;
  currentRobuxBalance?: number;
}
export type ModalService = { open: () => void; close: () => void };

export default function createUnifiedPurchaseVerificationModal() {
  let setOpenRef: React.Dispatch<React.SetStateAction<boolean>> | null = null;
  const modalService: ModalService = {
    open: () => {
      if (setOpenRef) {
        setOpenRef(true);
      }
    },
    close: () => {
      if (setOpenRef) {
        setOpenRef(false);
      }
    }
  };
  function UnifiedPurchaseVerificationModal({
    translate,
    title = '',
    expectedPrice,
    thumbnail,
    assetName,
    assetType,
    assetTypeDisplayName = '',
    sellerName,
    isPlace = false,
    onAction,
    loading = false,
    currentRobuxBalance
  }: UnifiedPurchaseVerificationModalProps) {
    const [open, setOpen] = React.useState(false);
    React.useEffect(() => {
      setOpenRef = setOpen;
      return () => {
        if (setOpenRef === setOpen) {
          setOpenRef = null;
        }
      };
    }, []);
    let defaultTitle;
    let actionButtonText;
    const assetInfo = {
      assetName: renderToString(<AssetName name={assetName} />),
      assetType: assetTypeDisplayName || assetType,
      seller: escapeHtml()(sellerName),
      robux: renderToString(
        <PriceLabel translate={translate} price={expectedPrice} color='' useFreeText={false} />
      )
    };
    let bodyMessageResource = isPlace
      ? resources.promptBuyAccessMessage
      : resources.promptBuyMessage;
    if (!isPlace && assetInfo.seller === '') {
      bodyMessageResource = resources.promptBuySimplifiedMessage;
    }

    if (expectedPrice === 0) {
      defaultTitle = translate(resources.getItemHeading);
      actionButtonText = translate(resources.getNowAction);
    } else {
      defaultTitle = translate(resources.buyItemHeading);
      actionButtonText = translate(resources.buyAction);
    }

    if (isPlace) {
      defaultTitle = translate(resources.buyExperience);
    }

    return (
      <UnifiedPurchaseModal
        {...{
          translate,
          titleText: title || defaultTitle,
          actionButtonText,
          expectedPrice,
          thumbnail,
          assetName,
          assetType,
          assetTypeDisplayName,
          sellerName,
          isPlace,
          onAction,
          loading,
          currentRobuxBalance,
          open,
          onCancel: modalService.close
        }}
      />
    );
  }
  return [
    withTranslations(UnifiedPurchaseVerificationModal, translationConfig.purchasingResources),
    modalService
  ];
}
