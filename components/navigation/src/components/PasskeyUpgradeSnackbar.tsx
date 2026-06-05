import { useState } from "react";
import { useTranslation, TranslationProvider } from "@rbx/core-scripts/react";
import { Snackbar } from "@rbx/foundation-ui";
import layoutConstants from "../constants/layoutConstants";
import { translations } from "../../component.json";

function PasskeyUpgradeSnackbarInner() {
  const { translate } = useTranslation();
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <Snackbar
      title={translate(layoutConstants.passkeyUpgradeConfirmationKeys.passkeyUpgradeSuccessMessage)}
      onClose={() => {
        setOpen(false);
      }}
      shouldAutoDismiss
    />
  );
}

export default function PasskeyUpgradeSnackbar() {
  return (
    <TranslationProvider config={translations}>
      <PasskeyUpgradeSnackbarInner />
    </TranslationProvider>
  );
}
