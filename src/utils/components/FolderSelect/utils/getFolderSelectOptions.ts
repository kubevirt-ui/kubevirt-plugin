import { SelectTypeaheadOptionProps } from '@kubevirt-utils/components/SelectTypeahead/SelectTypeahead';
import { SelectOptionProps } from '@patternfly/react-core';

import { createNewFolderOption } from './options';

/**
 * Builds FolderSelect typeahead options from existing namespace folders.
 * Injects the currently selected folder when it is not yet present on any VM,
 * so newly created folder names remain visible in the dropdown.
 * @param folderOptions
 * @param selectedFolder
 */
export const getFolderSelectOptions = (
  folderOptions: SelectOptionProps[] | undefined,
  selectedFolder: string,
): SelectTypeaheadOptionProps[] => {
  const mappedOptions =
    folderOptions?.map((option) => ({ optionProps: option, value: option.value })) ?? [];

  if (selectedFolder && !mappedOptions.some((option) => option.value === selectedFolder)) {
    return [
      { optionProps: createNewFolderOption(selectedFolder), value: selectedFolder },
      ...mappedOptions,
    ];
  }

  return mappedOptions;
};
