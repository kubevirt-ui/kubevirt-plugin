import { EnhancedSelectOptionProps } from './types';

export const getGroupedOptions = (
  filterOptions: EnhancedSelectOptionProps[],
  options: EnhancedSelectOptionProps[],
) => {
  if (options.some((option) => option.group)) {
    return filterOptions.reduce((groups, option) => {
      const group = option.group || 'Ungrouped';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(option);
      return groups;
    }, {} as Record<string, EnhancedSelectOptionProps[]>);
  }
  return null;
};
