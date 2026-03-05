import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@rbx/core-scripts/react";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import { AppIcon } from "@rbx/branding-assets";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";
import "@rbx/core-types";
import qrCode from "../images/install-app-qr-code.webp";
import { clientStatus } from "./api";

// TODO: could we do something better here? Not sure if this is consistent across translations.
const splitAtPeriod = (text: string) => {
  const index = text.indexOf(".");
  return index >= 0 ? (
    <React.Fragment>
      <span>{text.substring(0, index + 1)}</span>
      <span>{text.substring(index + 1)}</span>
    </React.Fragment>
  ) : (
    text
  );
};

const joinLinkId = "download-join-experience";

const DownloadDialog = ({
  download,
  launchGame,
  unmount,
}: {
  download: () => Promise<void>;
  launchGame?: () => Promise<void>;
  unmount: () => void;
}) => {
  const [downloaded, setDownloaded] = useState(false);
  const { translate } = useTranslation();
  const { isLoading } = useQuery({
    queryKey: ["client-status"],
    queryFn: async () => {
      const { status } = await clientStatus();
      if (status === "Unknown") {
        throw new Error(); // retry
      }
      unmount();
      return true;
    },
    retry: 2,
    retryDelay: 2500,
    cacheTime: 0,
  });

  // This is so cursed.
  useEffect(() => {
    if (launchGame != null && downloaded) {
      let link: HTMLElement | null = null;

      const observer = new MutationObserver(() => {
        link = document.getElementById(joinLinkId);
        if (link != null) {
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          link.addEventListener("click", launchGame);
          observer.disconnect();
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      return () => {
        observer.disconnect();
        if (link != null) {
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          link.removeEventListener("click", launchGame);
        }
      };
    }

    return undefined;
  }, [downloaded, launchGame]);

  if (!downloaded) {
    const title = translate(
      isLoading ? "Label.RobloxLoadingToPlay" : "Label.RobloxExciteToDownload",
    );
    return (
      <Dialog
        hasCloseAffordance
        closeLabel={translate("Action.Close")}
        isModal
        open
        size="Medium"
        onOpenChange={unmount}
      >
        <DialogContent className="download-dialog">
          <DialogBody className="flex flex-col items-center gap-xlarge">
            <AppIcon className="size-1600" />
            <DialogTitle
              className="text-heading-small padding-x-xxlarge padding-y-none text-align-x-center flex flex-col"
              aria-hidden
            >
              {isLoading ? splitAtPeriod(title) : title}
            </DialogTitle>
          </DialogBody>
          <DialogFooter className="flex">
            {isLoading ? (
              <Button variant="Emphasis" size="Medium" className="grow" isLoading />
            ) : (
              <Button
                variant="Emphasis"
                size="Medium"
                className="grow"
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onClick={async () => {
                  setDownloaded(true);
                  await download();
                }}
              >
                {translate("Title.DownloadPage")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const device = getDeviceMeta();
  const firstInstruction = device?.isIosDevice
    ? "Response.Dialog.MacFirstInstruction"
    : "Response.Dialog.WindowsFirstInstruction";
  const retryDownload = device?.isIosDevice
    ? getAbsoluteUrl("/download/client?os=mac")
    : getAbsoluteUrl("/download/client?os=win");

  return (
    <Dialog
      hasCloseAffordance
      closeLabel={translate("Action.Close")}
      isModal
      open
      size="Large"
      onOpenChange={unmount}
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
                // TODO: we need a better translation system
                // TODO: we should not be interpolating translated strings here
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: `${translate("Label.FollowInstallSteps")} ${translate(
                    "Label.RetryDownload",
                    {
                      startLink: `<a href="${retryDownload}" class="download-link-underline">`,
                      endLink: "</a>",
                    },
                  )}`,
                }}
              />
            </div>
            <div /> {/* Empty div to double gap (design wants super large gap) */}
            <div className="flex gap-xxlarge">
              <section className="flex flex-col gap-large grow basis-0">
                <h3 className="text-title-large content-emphasis padding-none">
                  {translate("Heading.InstallInstructions")}
                </h3>
                <ol className="download-instructions-list flex flex-col gap-xlarge margin-none padding-left-large text-body-medium">
                  <li
                    className="padding-left-medium"
                    // TODO: we need a better translation system
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                      __html: translate(firstInstruction, {
                        startBold: "<b>",
                        endBold: "</b>",
                      }),
                    }}
                  />
                  <li
                    className="padding-left-medium"
                    // TODO: we need a better translation system
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                      __html: translate("Response.Dialog.SecondInstruction", {
                        startBold: "<b>",
                        endBold: "</b>",
                      }),
                    }}
                  />
                  <li className="padding-left-medium">
                    {translate("Response.Dialog.ThirdInstruction")}
                  </li>
                  <li
                    className="padding-left-medium"
                    // TODO: we need a better translation system
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                      __html: translate("Response.Dialog.FourthInstruction", {
                        startLink: `<a id="${joinLinkId}" class="download-link-underline">`,
                        endLink: "</a>",
                      }),
                    }}
                  />
                </ol>
              </section>
              <div /> {/* Empty div to double gap (design wants super large gap) */}
              <div className="stroke-standard stroke-default" />
              <div /> {/* Empty div to double gap (design wants super large gap) */}
              <section className="flex flex-col grow basis-0 gap-xxlarge">
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
  );
};

export default DownloadDialog;
