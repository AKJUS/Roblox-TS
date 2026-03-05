import React, { JSX } from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import ItemCardStatus from "./ItemCardStatus";
import ItemCardRestrictions from "./ItemCardRestrictions";
import ItemCardPrice from "./ItemCardPrice";
import { ItemCardShoppingCardProps, TTimedOption } from "../constants/itemCardTypes";

// Re-export for backward compatibility
export type { ItemCardShoppingCardProps };

export type ItemCardThumbnailProps = {
  itemId: number;
  itemType: string;
  itemName: string;
  itemStatus: string[] | undefined;
  itemRestrictions: string[] | undefined;
  thumbnail2d: React.ReactNode;
  translate: TranslateFunction;
  isHovered: boolean;
  shoppingCartProps?: ItemCardShoppingCardProps;
  price?: number;
  lowestPrice?: number;
  premiumPricing?: number;
  creatorTargetId: number;
  priceStatus?: string;
  unitsAvailableForConsumption?: number;
  enableThumbnailPrice?: boolean;
  timedOptions?: TTimedOption[] | undefined;
};

function ItemCardThumbnail({
  itemId,
  itemType,
  itemName,
  itemStatus,
  itemRestrictions,
  thumbnail2d,
  translate,
  isHovered,
  shoppingCartProps,
  premiumPricing,
  lowestPrice,
  price,
  enableThumbnailPrice,
  creatorTargetId,
  priceStatus,
  unitsAvailableForConsumption,
  timedOptions,
}: ItemCardThumbnailProps): JSX.Element {
  let shoppingCartButtons = null;
  if (shoppingCartProps && isHovered) {
    const { isItemInCart, addItemToCart, removeItemFromCart } = shoppingCartProps;
    shoppingCartButtons = (
      <React.Fragment>
        {!isItemInCart && (
          <div className="add-to-cart-btn-container">
            <button
              type="button"
              className="btn-primary-md add-to-cart"
              onClick={evt => {
                evt.preventDefault();
                evt.stopPropagation();

                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                addItemToCart({ itemId, itemType, itemName, timedOptions }, true);
              }}
            >
              {translate("Action.Add")}
            </button>
          </div>
        )}
        {isItemInCart && (
          <div className="add-to-cart-btn-container">
            <button
              type="button"
              className="btn-secondary-md remove-from-cart"
              onClick={evt => {
                evt.preventDefault();
                evt.stopPropagation();

                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                removeItemFromCart(itemId, itemType, true);
              }}
            >
              {translate("Action.Remove")}
            </button>
          </div>
        )}
      </React.Fragment>
    );
  }

  return (
    <div className="item-card-link">
      <div className="item-card-thumb-container">
        {enableThumbnailPrice && (
          <ItemCardPrice
            price={price}
            creatorTargetId={creatorTargetId}
            lowestPrice={lowestPrice}
            priceStatus={priceStatus}
            premiumPricing={premiumPricing}
            unitsAvailableForConsumption={unitsAvailableForConsumption}
            enableThumbnailPrice={enableThumbnailPrice}
            timedOptions={timedOptions}
            translate={translate}
          />
        )}
        <div className="item-card-thumb-container-inner">{thumbnail2d}</div>
        <ItemCardStatus itemStatus={itemStatus} translate={translate} />
        <ItemCardRestrictions type={itemType} itemRestrictions={itemRestrictions} />

        {shoppingCartButtons}
      </div>
    </div>
  );
}

export default ItemCardThumbnail;
