import React from "react";
import PropTypes from "prop-types";
import { SimpleModal } from "@rbx/core-ui/legacy/react-style-guide";
import { withTranslations } from "@rbx/core-scripts/react";
import { translations } from "../../../component.json";

function PopupDisclaimer({ translate, isShopModalOpen, closeShopModal, onModalContinue }) {
  const modalBody = (
    <React.Fragment>
      <p className="shop-description">{translate("Description.RetailWebsiteRedirect")}</p>
      <p className="shop-warning">{translate("Description.PurchaseAgeWarning")}</p>
    </React.Fragment>
  );

  return (
    <SimpleModal
      title={translate("Heading.LeavingRoblox")}
      body={modalBody}
      show={isShopModalOpen}
      actionButtonShow
      actionButtonText={translate("Action.Continue")}
      neutralButtonText={translate("Action.Cancel")}
      onAction={onModalContinue}
      onNeutral={closeShopModal}
      onClose={closeShopModal}
    />
  );
}

PopupDisclaimer.propTypes = {
  translate: PropTypes.func.isRequired,
  isShopModalOpen: PropTypes.bool.isRequired,
  closeShopModal: PropTypes.func.isRequired,
  onModalContinue: PropTypes.func.isRequired,
};

export default withTranslations(PopupDisclaimer, translations);
