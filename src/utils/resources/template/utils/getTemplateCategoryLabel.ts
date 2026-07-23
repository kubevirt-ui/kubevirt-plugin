/**
 * Normalize user input into a Kubernetes-safe label value (spaces → '-').
 * @param category - raw category text from the typeahead
 */
export const toTemplateCategoryLabelValue = (category: string): string =>
  category.trim().replace(/\s+/g, '-');
