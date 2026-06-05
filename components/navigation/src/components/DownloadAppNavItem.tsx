import { useState } from "react";
import { Button, Dialog, DialogBody, DialogContent, DialogTitle } from "@rbx/foundation-ui";
import type { TranslateFunction } from "@rbx/core-scripts/react";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import {
  appDownloadLinkConstants,
  appDownloadType,
  getInstallInstructions,
  getRecommendedAppDownloadType,
  getUserAgent,
  installInstructionsDelayMs,
  sendPrimaryAppDownloadClickEvent,
} from "@rbx/app-download";
import qrCode from "@rbx/app-download/install-app-qr-code.png";
import { useTopNavDownloadButton } from "../util/topNavDownloadButtonIxp";

type Props = {
  translate: TranslateFunction;
};

function DownloadAppNavItem({ translate }: Props) {
  const isEnabled = useTopNavDownloadButton();
  const [showInstructions, setShowInstructions] = useState(false);

  if (!isEnabled) {
    return null;
  }

  const deviceMeta = getDeviceMeta();
  if (deviceMeta?.isPhone || deviceMeta?.isTablet) {
    return null;
  }

  const userAgent = getUserAgent();
  const downloadType = getRecommendedAppDownloadType(userAgent);
  const downloadLink = appDownloadLinkConstants[downloadType];
  if (downloadLink == null) {
    return null;
  }

  const href = downloadLink.isDirectDownload ? downloadLink.href : translate(downloadLink.href);
  const isMacOs = downloadType === appDownloadType.MacDirectDownload;
  const retryHref = isMacOs ? "/download/client?os=mac" : "/download/client?os=win";
  const installInstructions = getInstallInstructions();

  const handleDownloadClick = () => {
    sendPrimaryAppDownloadClickEvent(downloadLink.name);
    if (downloadLink.isDirectDownload) {
      window.setTimeout(() => {
        setShowInstructions(true);
      }, installInstructionsDelayMs);
    }
  };

  return (
    <li className="navbar-icon-item navbar-download-app-item">
      <Button
        as="a"
        variant="Emphasis"
        size="Small"
        className="navbar-download-app-button"
        href={href}
        target={downloadLink.isDirectDownload ? "_self" : "_blank"}
        rel={downloadLink.isDirectDownload ? undefined : "noopener noreferrer"}
        onClick={handleDownloadClick}
      >
        {translate("Action.Download") || "Download"}
      </Button>
      <Dialog
        open={showInstructions}
        size="Large"
        isModal
        hasCloseAffordance
        closeLabel={translate("Action.Close")}
        onOpenChange={() => {
          setShowInstructions(false);
        }}
      >
        <DialogContent className="install-dialog">
          <DialogBody className="content-default">
            <div className="flex flex-col gap-xlarge padding-xlarge">
              <div className="flex flex-col gap-xsmall">
                <DialogTitle className="text-heading-medium content-emphasis padding-none">
                  {translate("Heading.DownloadConfirmation")}
                </DialogTitle>
                <p
                  className="text-body-large"
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: `${translate("Label.FollowInstallSteps")} ${translate(
                      "Label.RetryDownload",
                      {
                        startLink: `<a href="${retryHref}" class="download-link-underline">`,
                        endLink: "</a>",
                      },
                    )}`,
                  }}
                />
              </div>
              <div className="flex gap-xxlarge">
                <section className="flex flex-col fill basis-0 gap-large">
                  <h3 className="text-title-large content-emphasis padding-none">
                    {translate("Heading.InstallInstructions")}
                  </h3>
                  <ol className="navbar-download-app-instructions margin-none text-body-medium">
                    {installInstructions.map(instructionKey => (
                      <li
                        key={instructionKey}
                        className="padding-left-small"
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{
                          __html: translate(instructionKey, {
                            startBold: "<b>",
                            endBold: "</b>",
                          }),
                        }}
                      />
                    ))}
                  </ol>
                </section>
                <div className="stroke-standard stroke-default" />
                <section className="flex flex-col fill basis-0 gap-xxlarge">
                  <div className="flex flex-col gap-small">
                    <h3 className="text-label-large content-emphasis padding-none">
                      {translate("Heading.MobileAppDownloadOption")}
                    </h3>
                    <p className="text-body-medium">{translate("Label.MobileAppQrCode")}</p>
                  </div>
                  <div className="flex grow justify-center items-center bg-shift-100 radius-medium padding-x-large">
                    <div className="radius-medium padding-small bg-[white]">
                      <img className="size-2100" src={qrCode} alt="" />
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </li>
  );
}

export default DownloadAppNavItem;
