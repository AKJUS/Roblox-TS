import {
  Dialog,
  DialogContent,
  DialogBody,
  DialogTitle,
  DialogFooter,
  Button,
} from "@rbx/foundation-ui";

type TUpsellModalProps = {
  titleText: string;
  bodyText: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  closeLabelText: string;
  onPrimaryButtonClick?: () => void;
  onSecondaryButtonClick?: () => void;
  isModalOpen: boolean;
  onCloseModal: () => void;
};

/**
 * Renders a generic upsell modal with a title, body, and up to two buttons.
 * The primary and secondary buttons are only displayed if the
 * corresponding text and click handlers are provided.
 *
 * All text strings are translated before being passed to the component.
 */
const UpsellModal = ({
  titleText,
  bodyText,
  primaryButtonText,
  secondaryButtonText,
  closeLabelText,
  onPrimaryButtonClick,
  onSecondaryButtonClick,
  isModalOpen,
  onCloseModal,
}: TUpsellModalProps): React.JSX.Element => {
  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={open => {
        if (!open) {
          onCloseModal();
        }
      }}
      size="Medium"
      isModal
      hasCloseAffordance
      closeLabel={closeLabelText}
    >
      <DialogContent>
        <DialogBody className="flex flex-col gap-large">
          <DialogTitle>{titleText}</DialogTitle>
          {bodyText}
        </DialogBody>
        <DialogFooter className="flex gap-x-medium">
          {secondaryButtonText && onSecondaryButtonClick && (
            <Button
              variant="Standard"
              size="Medium"
              onClick={onSecondaryButtonClick}
              className="grow basis-0"
            >
              {secondaryButtonText}
            </Button>
          )}
          {primaryButtonText && onPrimaryButtonClick && (
            <Button
              variant="Emphasis"
              size="Medium"
              onClick={onPrimaryButtonClick}
              className="grow basis-0"
            >
              {primaryButtonText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpsellModal;
