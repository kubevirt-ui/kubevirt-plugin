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
    country: 'ara',
    description: 'Arabic',
    map: ar,
  },
  bepo: {
    country: 'fr',
    description: 'French (Dvorak)',
    map: bepo,
    variant: 'dvorak',
  },
  cz: {
    country: 'cz',
    description: 'Czech',
    map: cz,
  },
  da: {
    country: 'dk',
    description: 'Danish',
    map: da,
  },
  de: {
    country: 'de',
    description: 'German (no dead keys)',
    map: de,
    variant: 'nodeadkeys',
  },
  'de-ch': {
    country: 'ch',
    description: 'German (Switzerland)',
    map: deCh,
  },
  'en-gb': {
    country: 'gb',
    description: 'English (UK)',
    map: engGb,
  },
  'en-us': {
    country: 'us',
    description: 'English (US)',
    map: engUs,
  },
  es: {
    country: 'es',
    description: 'Spanish',
    map: es,
  },
  et: {
    country: 'et',
    description: 'Amharic',
    map: et,
  },
  fi: {
    country: 'fi',
    description: 'Finnish',
    map: fi,
  },
  fo: {
    country: 'fo',
    description: 'Faroese',
    map: fo,
  },
  fr: {
    country: 'fr',
    description: 'French (no dead keys)',
    map: fr,
    variant: 'nodeadkeys',
  },
  'fr-be': {
    country: 'be',
    description: 'Belgian',
    map: frBe,
  },
  'fr-ca': {
    country: 'ca',
    description: 'French (Canada)',
    map: frCa,
    variant: 'fr',
  },
  'fr-ch': {
    country: 'ch',
    description: 'French (Switzerland)',
    map: frCh,
    variant: 'fr',
  },
  hr: {
    country: 'hr',
    description: 'Croatian',
    map: hr,
  },
  hu: {
    country: 'hu',
    description: 'Hungarian',
    map: hu,
  },
  is: {
    country: 'is',
    description: 'Icelandic',
    map: is,
  },
  it: {
    country: 'it',
    description: 'Italian',
    map: it,
  },
  ja: {
    country: 'jp',
    description: 'Japanese (jp106)',
    map: ja,
    variant: 'jp106',
  },
  lt: {
    country: 'lt',
    description: 'Lithuanian',
    map: lt,
  },
  lv: {
    country: 'lv',
    description: 'Latvian',
    map: lv,
  },
  mk: {
    country: 'mk',
    description: 'Macedonian',
    map: mk,
  },
  nl: {
    country: 'nl',
    description: 'Dutch',
    map: nl,
  },
  pl: {
    country: 'pl',
    description: 'Polish',
    map: pl,
  },
  pt: {
    country: 'pt',
    description: 'Portuguese',
    map: pt,
  },
  'pt-br': {
    country: 'br',
    description: 'Portuguese (Brazil)',
    map: ptBr,
  },
  ru: {
    country: 'ru',
    description: 'Russian',
    map: ru,
  },
  th: {
    country: 'th',
    description: 'Thai',
    map: th,
  },
  tr: {
    country: 'tr',
    description: 'Turkish',
    map: tr,
  },
};
