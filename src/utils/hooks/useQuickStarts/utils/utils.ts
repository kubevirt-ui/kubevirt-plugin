import {
  LOCALIZATION_COUNTRY_LABEL,
  LOCALIZATION_LANGUAGE_LABEL,
  LOCALIZATION_NAME_LABEL,
} from '@kubevirt-utils/hooks/useQuickStarts/utils/constants';
import { QuickStart } from '@patternfly/quickstarts';

export const getQuickStartNameRef = (quickStart: QuickStart) =>
  quickStart.metadata.labels?.[LOCALIZATION_NAME_LABEL] ||
  quickStart.metadata.annotations?.[LOCALIZATION_NAME_LABEL] ||
  quickStart.metadata.name;

export const groupQuickStartsByName = (quickStarts: QuickStart[]) => {
  return quickStarts.reduce<Record<string, QuickStart[]>>((grouped, quickStart) => {
    const name = getQuickStartNameRef(quickStart);
    if (!grouped[name]) grouped[name] = [];
    grouped[name].push(quickStart);
    return grouped;
  }, {});
};

/**
 * Returns the QuickStart with the best localization match, for the given
 * preferred language and preferred country. It prefers a match in this order:
 *
 * 1. QuickStart language and country are equal to the preferred language and country.
 *    This includes sample without language (fallbacks to en) and no country.
 *
 * 2. QuickStart language is equal to the preferred language.
 *    1. And the quick starts has no country defined.  (eg, select en quick starts is used for en-CA and en-GB)
 *    2. Any country is defined.                       (eg, select en-CA quick starts is used for en-GB)
 *
 * 3. Fallback to an english quick starts
 *    (QuickStart language is en OR quick starts language is not defined):
 *    1. Same country  (use en-CA quick starts if preference is fr-CA)
 *    2. No country
 *    3. Any country   (use en-CA quick starts if preference is en-US)
 * @param quickStarts QuickStart custom resources
 * @param language Language code
 */
export const getBestMatch = (quickStarts: QuickStart[], language: string): null | QuickStart => {
  if (!quickStarts || !quickStarts.length) {
    return null;
  }
  const preferredLanguage = (language || 'en').split('-')[0].toLowerCase();
  const preferredCountry = ((language || '').split('-')[1] || '').toUpperCase();

  let sameLanguageWithoutCountry: QuickStart = null;
  let sameLanguageWithAnyCountry: QuickStart = null;
  let fallbackLanguageSameCountry: QuickStart = null;
  let fallbackLanguageNoCountry: QuickStart = null;
  let fallbackLanguageAnyCountry: QuickStart = null;

  for (const quickStart of quickStarts) {
    const quickStartLanguage = (
      quickStart.metadata?.labels?.[LOCALIZATION_LANGUAGE_LABEL] || 'en'
    ).toLowerCase();
    const quickStartCountry = (
      quickStart.metadata?.labels?.[LOCALIZATION_COUNTRY_LABEL] || ''
    ).toUpperCase();

    if (quickStartLanguage === preferredLanguage && quickStartCountry === preferredCountry) {
      return quickStart;
    }
    if (quickStartLanguage === preferredLanguage) {
      if (!quickStartCountry && !sameLanguageWithoutCountry) {
        sameLanguageWithoutCountry = quickStart;
      } else if (quickStartCountry && !sameLanguageWithAnyCountry) {
        sameLanguageWithAnyCountry = quickStart;
      }
    }
    if (quickStartLanguage === 'en') {
      if (quickStartCountry === preferredCountry && !fallbackLanguageSameCountry) {
        fallbackLanguageSameCountry = quickStart;
      } else if (!quickStartCountry && !fallbackLanguageNoCountry) {
        fallbackLanguageNoCountry = quickStart;
      } else if (!fallbackLanguageAnyCountry) {
        fallbackLanguageAnyCountry = quickStart;
      }
    }
  }
  return (
    sameLanguageWithoutCountry ||
    sameLanguageWithAnyCountry ||
    fallbackLanguageSameCountry ||
    fallbackLanguageNoCountry ||
    fallbackLanguageAnyCountry
  );
};
