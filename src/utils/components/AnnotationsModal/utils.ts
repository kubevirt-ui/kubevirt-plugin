import { type TFunction } from 'i18next';

import { hasDuplicateKeys } from '@kubevirt-utils/utils/labelValidation/labelValidation';

export type AnnotationEntry = { key: string; value: string };

export type AnnotationRowValidation = { hasDuplicates: boolean; hasEmptyKeys: boolean };

export const getIdAnnotations = (
  annotations: Record<string, string> = {},
): Record<number, AnnotationEntry> =>
  Object.fromEntries(Object.entries(annotations).map(([key, value], i) => [i, { key, value }]));

export const toAnnotations = (rows: Record<number, AnnotationEntry>): Record<string, string> =>
  Object.fromEntries(
    Object.values(rows)
      .filter(({ key }) => key.trim())
      .map(({ key, value }) => [key, value]),
  );

export const getAnnotationRowValidation = (
  annotations: Record<number, AnnotationEntry>,
): AnnotationRowValidation => {
  const annotationEntries = Object.values(annotations);

  return {
    hasDuplicates: hasDuplicateKeys(annotationEntries.map(({ key }) => key)),
    hasEmptyKeys: annotationEntries.some(({ key }) => !key.trim()),
  };
};

export const getAnnotationKeyRequiredMessage = (t: TFunction): string =>
  t('Annotation key is required');

export const getAnnotationsSubmitDisabledTooltip = (
  { hasDuplicates, hasEmptyKeys }: AnnotationRowValidation,
  emptyKeyMessage: string,
  duplicateKeysMessage: string,
): string | undefined => {
  if (hasEmptyKeys) {
    return emptyKeyMessage;
  }

  if (hasDuplicates) {
    return duplicateKeysMessage;
  }

  return undefined;
};
