/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import React from 'react';
import { Button, Loading, Modal } from 'react-style-guide';
import { TranslateFunction } from 'react-utilities';
import { useSelector } from 'react-redux';
import { DeviceMeta } from 'Roblox';
import { selectIDVState } from '../verificationSlice';
import { ActionConstants, LabelConstants } from '../constants/textConstants';

function VendorlinkPage({
  translate,
  onHide
}: {
  translate: TranslateFunction;
  onHide: () => void;
}): React.ReactElement {
  const IDVStore = useSelector(selectIDVState);
  const { vendorVerificationData } = IDVStore;
  const { loading } = vendorVerificationData;
  const isIosApp = (DeviceMeta && DeviceMeta().isIosApp) ?? false;
  // VPC requires a in-place redirection but need to open new tab for iOS app webview (Persona hosted flow is not compatible with webview on iOS)
  const mobileLinkTarget = isIosApp ? '_blank' : '_self';

  return (
    <React.Fragment>
      <Modal.Header useBaseBootstrapComponent>
        <button type='button' className='email-upsell-title-button' onClick={onHide}>
          <span className='close icon-close' />
        </button>
        <div className='email-upsell-title-container'>
          <Modal.Title id='contained-modal-title-vcenter'>
            {translate('Heading.IdentityVerification')}
          </Modal.Title>
        </div>
      </Modal.Header>
      {loading ? (
        <Loading />
      ) : (
        <Modal.Body className='verification-link-page-content'>
          <div className='verification-link-upsell'>
            {translate(LabelConstants.AgeVerifyPrompt)}
          </div>
          <div className='preparation-list-wrapper'>
            <div className='preparation-list-item'>
              <span className='icon-menu-document' />
              <div className='preparation-list-text'>
                <div className='preparation-title'>{translate(LabelConstants.PrepareId)}</div>
                <div className='preparation-text'>{translate(LabelConstants.ValidIdList)}</div>
              </div>
            </div>
          </div>
          <p
            className='verification-link-legal'
            dangerouslySetInnerHTML={{
              __html: translate(LabelConstants.PrivacyNoticeAndLink, {
                spanStart:
                  "<a class='text-link' href='https://en.help.roblox.com/hc/en-us/articles/4412863575316'>",
                spanEnd: '</a>'
              })
            }}
          />
          <a
            href={vendorVerificationData.verificationLink}
            target={mobileLinkTarget}
            rel='noreferrer'>
            <Button
              onClick={() => console.log('start sesesion')}
              className='primary-link'
              variant={Button.variants.primary}
              size={Button.sizes.medium}
              width={Button.widths.full}>
              {translate(ActionConstants.StartSession)}
            </Button>
          </a>
        </Modal.Body>
      )}
    </React.Fragment>
  );
}

export default VendorlinkPage;
