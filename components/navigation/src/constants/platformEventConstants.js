// Note: All commented out locales share the same event name and logo as English for
// the current platform event.

import { getNavigationContainer } from './searchConstants';
import logoVn from '../images/Roblox_TheTakeover_Icon_400x400_VN.webp';
import logoTr from '../images/Roblox_TheTakeover_Icon_400x400_TR.webp';
// import logoTh from '../images/';
import logoPtbr from '../images/Roblox_TheTakeover_Icon_400x400_PTBR.webp';
import logoPl from '../images/Roblox_TheTakeover_Icon_400x400_PL.webp';
// import logoKo from '../images/';
import logoJp from '../images/Roblox_TheTakeover_Icon_400x400_JP.webp';
// import logoIt from '../images/';
// import logoId from '../images/';
import logoFr from '../images/Roblox_TheTakeover_Icon_400x400_FR.webp';
import logoEs from '../images/Roblox_TheTakeover_Icon_400x400_ESMX.webp';
import logoEn from '../images/Roblox_TheTakeover_Icon_400x400.webp';
// import logoDe from '../images/';
// import logoCht from '../images/The_Hatch_Final_400x400_CHT.webp';
import logoChs from '../images/Roblox_TheTakeover_Icon_400x400_CHS.webp';
// import logoAr from '../images/The_Hatch_Final_400x400_AR.webp';

const thumbnails = {
  vi_vn: logoVn,
  tr_tr: logoTr,
  // th_th: logoTh,
  pt_br: logoPtbr,
  pl_pl: logoPl,
  // ko_kr: logoKo,
  ja_jp: logoJp,
  // it_it: logoIt,
  // id_id: logoId,
  fr_fr: logoFr,
  es_es: logoEs,
  en_us: logoEn,
  // de_de: logoDe,
  // zh_tw: logoCht,
  zh_cn: logoChs
  // ar_001: logoAr
};

export default {
  showPlatformEventStartTime: () =>
    getNavigationContainer()?.dataset.platformEventLeftNavEntryStartTime
      ? new Date(
          Date.parse(`${getNavigationContainer()?.dataset.platformEventLeftNavEntryStartTime} UTC`)
        )
      : new Date('01/01/2001'),

  showPlatformEventEndTime: () =>
    getNavigationContainer()?.dataset.platformEventLeftNavEntryEndTime
      ? new Date(
          Date.parse(`${getNavigationContainer()?.dataset.platformEventLeftNavEntryEndTime} UTC`)
        )
      : new Date('01/01/2001'),

  platfromEventURL: () =>
    getNavigationContainer()?.dataset.platformEventLeftNavUrl
      ? getNavigationContainer()?.dataset.platformEventLeftNavUrl
      : '',

  localizedThumbnail: locale => (thumbnails[locale] ? thumbnails[locale] : logoEn)
};
