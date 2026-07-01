import { isEmpty } from '@kubevirt-utils/utils/utils';
import { SearchItemWithTab } from '@virtualmachines/details/tabs/configuration/utils/search';

const MAX_RESULTS_TO_DISPLAY = 9;

export const getOptions = (
  searchItems: SearchItemWithTab[],
  query: string,
): SearchItemWithTab[] => {
  if (isEmpty(query)) {
    return searchItems;
  }
  const lowerCaseQueryValue = query.toLowerCase();

  const filteredAndSortedItems = searchItems
    .filter(
      ({ element }) =>
        !element?.isDisabled && element?.title?.toLowerCase().includes(lowerCaseQueryValue),
    )
    .sort((firstItem, secondItem) => {
      const firstItemStartsWith = firstItem.element.title
        .toLowerCase()
        .startsWith(lowerCaseQueryValue);
      const secondItemStartsWith = secondItem.element.title
        .toLowerCase()
        .startsWith(lowerCaseQueryValue);
      return Number(!firstItemStartsWith) - Number(!secondItemStartsWith);
    });

  const firstNineResults = filteredAndSortedItems.slice(0, MAX_RESULTS_TO_DISPLAY);

  return firstNineResults;
};
