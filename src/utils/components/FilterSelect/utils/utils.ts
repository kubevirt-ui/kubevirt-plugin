import { type EnhancedSelectOptionProps } from './types';

export const getGroupedOptions = (
  filterOptions: EnhancedSelectOptionProps[],
  options: EnhancedSelectOptionProps[],
): Record<string, EnhancedSelectOptionProps[]> | null => {
  if (options.some((option) => option.group)) {
    return filterOptions.reduce<Record<string, EnhancedSelectOptionProps[]>>(
      (groups, option) => {
        const group = option.group ?? 'Ungrouped';
        groups[group] ??= [];
        groups[group].push(option);
        return groups;
      },
      {} as Record<string, EnhancedSelectOptionProps[]>,
    );
  }
  return null;
};
