import { JSX } from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { ItemStatus, mapItemStatusIconsAndLabels } from "../utils";

function ItemCardStatus({
  itemStatus,
  translate,
}: {
  itemStatus: string[] | undefined;
  translate: TranslateFunction;
}): JSX.Element | null {
  const itemStatusLabels = mapItemStatusIconsAndLabels(itemStatus);
  return itemStatus?.length ? (
    <div className="item-cards-stackable">
      <div className="asset-status-icon">
        {itemStatusLabels.map((status: ItemStatus) => (
          <div className={`${status.isIcon ? "has-icon" : ""} ${status.class}`} key={status.type}>
            {status.isIcon && <span className={status.type} />}
            {status.label && <span>{translate(status.label)}</span>}
          </div>
        ))}
      </div>
    </div>
  ) : null;
}

export default ItemCardStatus;
