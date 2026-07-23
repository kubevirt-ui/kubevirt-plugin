import { type SelectTypeaheadOptionProps } from '@kubevirt-utils/components/SelectTypeahead/SelectTypeahead';

export const getCategorySelectOptions = (
  categories: string[],
  selectedCategory?: string,
): SelectTypeaheadOptionProps[] => {
  const uniqueCategories = new Set(categories);

  if (selectedCategory) {
    uniqueCategories.add(selectedCategory);
  }

  return Array.from(uniqueCategories)
    .sort((a, b) => a.localeCompare(b))
    .map((category) => ({
      label: category,
      value: category,
    }));
};
