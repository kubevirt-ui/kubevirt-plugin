import {
  LOCALIZATION_COUNTRY_LABEL,
  LOCALIZATION_LANGUAGE_LABEL,
  LOCALIZATION_NAME_LABEL,
} from '@kubevirt-utils/hooks/useQuickStarts/utils/constants';
import { type QuickStart } from '@patternfly/quickstarts';

export const getQuickStartNameRef = (quickStart: QuickStart): string =>
  quickStart.metadata.labels?.[LOCALIZATION_NAME_LABEL] ??
  quickStart.metadata.annotations?.[LOCALIZATION_NAME_LABEL] ??
  quickStart.metadata.name;

export const groupQuickStartsByName = (quickStarts: QuickStart[]): Record<string, QuickStart[]> => {
  return quickStarts.reduce<Record<string, QuickStart[]>>((grouped, quickStart) => {
    const name = getQuickStartNameRef(quickStart);
    grouped[name] ??= [];
    grouped[name].push(quickStart);
    return grouped;
  }, {});
};

const extractLocale = (
  quickStart: QuickStart,
): { quickStartCountry: string; quickStartLanguage: string } => {
  const quickStartLanguage = (
    quickStart.metadata?.labels?.[LOCALIZATION_LANGUAGE_LABEL] ?? 'en'
  ).toLowerCase();
  const quickStartCountry = (
    quickStart.metadata?.labels?.[LOCALIZATION_COUNTRY_LABEL] ?? ''
  ).toUpperCase();
  return { quickStartCountry, quickStartLanguage };
};

const findLanguageFallback = (
  quickStart: QuickStart,
  quickStartLanguage: string,
  quickStartCountry: string,
  preferredLanguage: string,
  sameLanguageWithoutCountry: null | QuickStart,
  sameLanguageWithAnyCountry: null | QuickStart,
): {
  sameLanguageWithAnyCountry: null | QuickStart;
  sameLanguageWithoutCountry: null | QuickStart;
} => {
  let updatedWithoutCountry = sameLanguageWithoutCountry;
  let updatedWithAnyCountry = sameLanguageWithAnyCountry;

  if (quickStartLanguage === preferredLanguage) {
    if (!quickStartCountry && !updatedWithoutCountry) {
      updatedWithoutCountry = quickStart;
    } else if (quickStartCountry && !updatedWithAnyCountry) {
      updatedWithAnyCountry = quickStart;
    }
  }

  return {
    sameLanguageWithAnyCountry: updatedWithAnyCountry,
    sameLanguageWithoutCountry: updatedWithoutCountry,
  };
};

const findEnglishFallback = (
  quickStart: QuickStart,
  quickStartLanguage: string,
  quickStartCountry: string,
  preferredCountry: string,
  fallbackLanguageSameCountry: null | QuickStart,
  fallbackLanguageNoCountry: null | QuickStart,
  fallbackLanguageAnyCountry: null | QuickStart,
): {
  fallbackLanguageAnyCountry: null | QuickStart;
  fallbackLanguageNoCountry: null | QuickStart;
  fallbackLanguageSameCountry: null | QuickStart;
} => {
  let updatedSameCountry = fallbackLanguageSameCountry;
  let updatedNoCountry = fallbackLanguageNoCountry;
  let updatedAnyCountry = fallbackLanguageAnyCountry;

  if (quickStartLanguage === 'en') {
    if (quickStartCountry === preferredCountry && !updatedSameCountry) {
      updatedSameCountry = quickStart;
    } else if (!quickStartCountry && !updatedNoCountry) {
      updatedNoCountry = quickStart;
    } else {
      updatedAnyCountry ??= quickStart;
    }
  }

  return {
    fallbackLanguageAnyCountry: updatedAnyCountry,
    fallbackLanguageNoCountry: updatedNoCountry,
    fallbackLanguageSameCountry: updatedSameCountry,
  };
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
  if (!quickStarts?.length) {
    return null;
  }
  const preferredLanguage = (language ?? 'en').split('-')[0].toLowerCase();
  const preferredCountry = ((language ?? '').split('-')[1] ?? '').toUpperCase();

  let sameLanguageWithoutCountry: null | QuickStart = null;
  let sameLanguageWithAnyCountry: null | QuickStart = null;
  let fallbackLanguageSameCountry: null | QuickStart = null;
  let fallbackLanguageNoCountry: null | QuickStart = null;
  let fallbackLanguageAnyCountry: null | QuickStart = null;

  for (const quickStart of quickStarts) {
    const { quickStartCountry, quickStartLanguage } = extractLocale(quickStart);

    if (quickStartLanguage === preferredLanguage && quickStartCountry === preferredCountry) {
      return quickStart;
    }

    const langResult = findLanguageFallback(
      quickStart,
      quickStartLanguage,
      quickStartCountry,
      preferredLanguage,
      sameLanguageWithoutCountry,
      sameLanguageWithAnyCountry,
    );
    sameLanguageWithoutCountry = langResult.sameLanguageWithoutCountry;
    sameLanguageWithAnyCountry = langResult.sameLanguageWithAnyCountry;

    const enResult = findEnglishFallback(
      quickStart,
      quickStartLanguage,
      quickStartCountry,
      preferredCountry,
      fallbackLanguageSameCountry,
      fallbackLanguageNoCountry,
      fallbackLanguageAnyCountry,
    );
    fallbackLanguageSameCountry = enResult.fallbackLanguageSameCountry;
    fallbackLanguageNoCountry = enResult.fallbackLanguageNoCountry;
    fallbackLanguageAnyCountry = enResult.fallbackLanguageAnyCountry;
  }
  return (
    sameLanguageWithoutCountry ??
    sameLanguageWithAnyCountry ??
    fallbackLanguageSameCountry ??
    fallbackLanguageNoCountry ??
    fallbackLanguageAnyCountry
  );
};
