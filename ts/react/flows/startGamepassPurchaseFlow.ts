import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailFormat,
  ThumbnailGamePassIconSize
} from 'roblox-thumbnails';
import { ASSET_TYPE_ENUM } from '../../../js/core/services/itemPurchaseUpsellService/constants/upsellConstants';
import createItemPurchase from '../../../js/react/itemPurchase/factories/createItemPurchase';
import GamepassItemPurchaseWrapper from '../components/GamepassItemPurchaseWrapper';

export type TStartGamepassPurchaseFlowArgs = {
  thumbnail: React.ReactNode;
  imageUrl: string;
  productId: number;
  assetName: string;
  sellerName: string;
  expectedSellerId: number;
  expectedPrice: number;
  iconAssetId: number;
  onPurchaseSuccess?: () => void;
};

export function startGamepassPurchaseFlow(args: TStartGamepassPurchaseFlowArgs): () => void {
  const containerId = 'rbx-gamepass-purchase-root';
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }

  const thumbnail = React.createElement(Thumbnail2d, {
    type: ThumbnailTypes.assetThumbnail,
    targetId: args.iconAssetId,
    size: ThumbnailGamePassIconSize.size150,
    format: ThumbnailFormat.webp,
    altName: args.assetName
  });

  const [ItemPurchase, itemPurchaseService] = createItemPurchase() as [
    React.FC<any>,
    { start: () => void }
  ];

  render(
    React.createElement(GamepassItemPurchaseWrapper, {
      ItemPurchase,
      itemPurchaseService,
      innerProps: {
        thumbnail,
        productId: args.productId,
        assetName: args.assetName,
        assetType: ASSET_TYPE_ENUM.GAME_PASS,
        sellerName: args.sellerName,
        expectedCurrency: 1,
        expectedSellerId: args.expectedSellerId,
        expectedPrice: args.expectedPrice,
        onPurchaseSuccess: args.onPurchaseSuccess
      }
    }),
    container
  );

  return () => {
    if (container) {
      unmountComponentAtNode(container);
      container.remove();
    }
  };
}
