import { type TFunction } from 'i18next';

import { type SelectTypeaheadOptionProps } from '@kubevirt-utils/components/SelectTypeahead/SelectTypeahead';
import { type SelectOptionProps } from '@patternfly/react-core';

import { PROJECT_ROOT_FOLDER_VALUE } from './constants';
import { createNewFolderOption, createProjectRootOption } from './options';

/**
 * Builds FolderSelect typeahead options from existing namespace folders.
 * Injects the currently selected folder when it is not yet present on any VM,
 * so newly created folder names remain visible in the dropdown.
 * @param folderOptions
 * @param t
 * @param selectedFolder
 */
export const getFolderSelectOptions = (
  folderOptions: SelectOptionProps[] | undefined,
  t: TFunction,
  selectedFolder?: string,
): SelectTypeaheadOptionProps[] => {
  const projectRootOptions = [
    { optionProps: createProjectRootOption(t), value: PROJECT_ROOT_FOLDER_VALUE },
  ];

  const mappedOptions =
    folderOptions?.map((option) => ({
      optionProps: option,
      value: String(option.value),
    })) ?? [];

  const optionsWithProjectRoot = [...projectRootOptions, ...mappedOptions];

  if (selectedFolder && !optionsWithProjectRoot.some((option) => option.value === selectedFolder)) {
    return [
      ...projectRootOptions,
      { optionProps: createNewFolderOption(selectedFolder), value: selectedFolder },
      ...mappedOptions,
    ];
  }

  return optionsWithProjectRoot;
};
