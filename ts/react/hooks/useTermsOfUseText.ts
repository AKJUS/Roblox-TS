import { RobloxIntlInstance } from 'Roblox';
import { useState, useEffect } from 'react';
import { TranslateFunction } from 'react-utilities';
import { urlService } from 'core-utilities';
import {
  ROBLOX_TERMS_OF_USE_URL,
  ROBLOX_TERMS_OF_USE_ANCHOR_FOR_DMCCA,
  LANG_KEYS
} from '../../../js/core/services/itemPurchaseUpsellService/constants/upsellConstants';
import ampFeatureService from '../services/ampFeatureService';

export default function useTermsOfUseText(translate: TranslateFunction, intl: RobloxIntlInstance) {
  const [termsOfUseText, setTermsOfUseText] = useState('');
  const [isDmccaLegalTextFeature, setIsDmccaLegalTextFeature] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ampFeatureService()
      .getDmccaLegalTextFeature()
      .then(isShowDmcca => {
        if (isShowDmcca) {
          setIsDmccaLegalTextFeature(true);
        }
      })
      .catch(err => {
        console.warn('Failed to fetch DMCCA feature', err);
      });
  }, []);

  useEffect(() => {
    let url = urlService.getUrlWithLocale(ROBLOX_TERMS_OF_USE_URL, intl.getRobloxLocale());
    if (isDmccaLegalTextFeature) {
      url += ROBLOX_TERMS_OF_USE_ANCHOR_FOR_DMCCA;
    }

    const termsOfUseTag = `<a style='text-decoration: underline;' target='_blank' href='${url}'>`;

    const formattedTermsOfUseText = translate(LANG_KEYS.termsOfUseText, {
      aTagStart: termsOfUseTag,
      aTagEnd: '</a>'
    });

    setTermsOfUseText(formattedTermsOfUseText);
  }, [isDmccaLegalTextFeature, intl, translate]);

  return termsOfUseText;
}
