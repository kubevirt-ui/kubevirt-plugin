import { hasDuplicateKeys } from '@kubevirt-utils/utils/labelValidation/labelValidation';

export type AnnotationEntry = { key: string; value: string };

export const getIdAnnotations = (
  annotations: Record<string, string>,
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
): { hasDuplicates: boolean; hasEmptyKeys: boolean } => {
  const annotationEntries = Object.values(annotations);

  return {
    hasDuplicates: hasDuplicateKeys(annotationEntries.map(({ key }) => key)),
    hasEmptyKeys: annotationEntries.some(({ key }) => !key.trim()),
  };
};
