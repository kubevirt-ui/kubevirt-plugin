import { KeyboardLayout, KeyMapDef } from '../types';

import ar from './ar';
import bepo from './bepo';
import cz from './cz';
import da from './da';
import de from './de';
import deCh from './de-ch';
import engGb from './eng-gb';
import engUs from './eng-us';
import es from './es';
import et from './et';
import fi from './fi';
import fo from './fo';
import fr from './fr';
import frBe from './fr-be';
import frCa from './fr-ca';
import frCh from './fr-ch';
import hr from './hr';
import hu from './hu';
import is from './is';
import it from './it';
import ja from './ja';
import lt from './lt';
import lv from './lv';
import mk from './mk';
import nl from './nl';
import pl from './pl';
import pt from './pt';
import ptBr from './pt-br';
import ru from './ru';
import th from './th';
import tr from './tr';

// based on https://github.com/qemu/qemu/blob/b69801dd6b1eb4d107f7c2f643adf0a4e3ec9124/pc-bios/keymaps/meson.build

export const keyMaps: { [key in KeyboardLayout]: KeyMapDef } = {
  ar: {
    l: 'ara',
    map: ar,
  },
  bepo: {
    l: 'fr',
    map: bepo,
    v: 'dvorak',
  },
  cz: {
    l: 'cz',
    map: cz,
  },
  da: {
    l: 'dk',
    map: da,
  },
  de: {
    l: 'de',
    map: de,
    v: 'nodeadkeys',
  },
  'de-ch': {
    l: 'ch',
    map: deCh,
  },
  'en-gb': { l: 'gb', map: engGb },
  'en-us': { l: 'us', map: engUs },
  es: { l: 'es', map: es },
  et: { l: 'et', map: et },
  fi: { l: 'fi', map: fi },
  fo: { l: 'fo', map: fo },
  fr: { l: 'fr', map: fr, v: 'nodeadkeys' },
  'fr-be': { l: 'be', map: frBe },
  'fr-ca': { l: 'ca', map: frCa, v: 'fr' },
  'fr-ch': { l: 'ch', map: frCh, v: 'fr' },
  hr: { l: 'hr', map: hr },
  hu: { l: 'hu', map: hu },
  is: { l: 'is', map: is },
  it: { l: 'it', map: it },
  ja: { l: 'jp', m: 'jp106', map: ja },
  lt: { l: 'lt', map: lt },
  lv: { l: 'lv', map: lv },
  mk: { l: 'mk', map: mk },
  nl: { l: 'nl', map: nl },
  pl: { l: 'pl', map: pl },
  pt: { l: 'pt', map: pt },
  'pt-br': { l: 'br', map: ptBr },
  ru: { l: 'ru', map: ru },
  th: { l: 'th', map: th },
  tr: { l: 'tr', map: tr },
};
