import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import { urlService } from '@rbx/core-scripts/legacy/core-utilities';
import { sendEventWithTarget, targetTypes } from '@rbx/core-scripts/event-stream';
import { linksList, linksListWithGiftCardLabel } from '../constants/footerConstants';
import CookieConsentLink from './CookieConsentLink';

function sendRobuxFooterEvent(className, event) {
  sendEventWithTarget(
    'PageFooter',
    'click',
    {
      destination: `${className}`,
      source: `${event.currentTarget.ownerDocument.location.pathname}`
    },
    targetTypes.WWW
  );
}

function FooterLinks({ translate, intl }) {
  let linksPointer = linksList;

  let isEnabled = false;
  const element = document.getElementById('footer-container');
  if (element != null) {
    const giftCardsValue = element.getAttribute('data-is-giftcards-footer-enabled');
    if (giftCardsValue != null) {
      isEnabled = giftCardsValue.toLowerCase() === 'true';
    }
  }

  if (isEnabled) {
    linksPointer = linksListWithGiftCardLabel;
  }

  const links = linksPointer.map(link => (
    <li key={link.name} className="footer-link">
      <a
        href={urlService.getUrlWithLocale(link.path, intl.getRobloxLocale())}
        className={ClassNames('text-footer-nav', link.cssClass)}
        target="_blank"
        rel="noreferrer"
        onClick={e => sendRobuxFooterEvent(link.name, e)}
      >
        {translate(link.labelTranslationKey)}
        {link.postfixIcon ? (
          <img src={link.postfixIcon} alt="" className="footer-postfixIcon" />
        ) : (
          ''
        )}
      </a>
    </li>
  ));
  return (
    <ul className="row footer-links">
      {links}
      <li>
        <CookieConsentLink translate={translate} />
      </li>
    </ul>
  );
}

FooterLinks.propTypes = {
  translate: PropTypes.func.isRequired,
  intl: PropTypes.shape({ getRobloxLocale: PropTypes.func.isRequired }).isRequired
};

export default FooterLinks;
