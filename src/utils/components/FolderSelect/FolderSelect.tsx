import React, { FC, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import SelectTypeahead from '../SelectTypeahead/SelectTypeahead';

import useFolderOptions from './hooks/useFolderOptions';
import { getFolderSelectOptions } from './utils/getFolderSelectOptions';
import { createNewFolderOption, getCreateNewFolderOption } from './utils/options';
import { getToggleStatus } from './utils/validation';

type FoldersSelectProps = {
  cluster?: string;
  isDisabled?: boolean;
  isFullWidth?: boolean;
  namespace: string;
  selectedFolder: string;
  setSelectedFolder: (newFolder: string) => void;
};
const FolderSelect: FC<FoldersSelectProps> = ({
  cluster,
  isDisabled = false,
  isFullWidth = false,
  namespace,
  selectedFolder,
  setSelectedFolder,
}) => {
  const { t } = useKubevirtTranslation();
  const [folderOptions, setFolderOptions] = useFolderOptions(namespace, cluster);
  const options = useMemo(
    () => getFolderSelectOptions(folderOptions, selectedFolder),
    [folderOptions, selectedFolder],
  );

  return (
    <SelectTypeahead
      addOption={(input) => {
        setFolderOptions((prev) => [
          ...(prev ?? []).filter((opt) => opt.value !== input),
          createNewFolderOption(input),
        ]);
        return true;
      }}
      canCreate
      dataTestId="vm-folder-select"
      getCreateAction={getCreateNewFolderOption}
      getToggleStatus={getToggleStatus}
      isDisabled={isDisabled}
      isFullWidth={isFullWidth}
      options={options}
      placeholder={t('Search group')}
      selectedValue={selectedFolder}
      setSelectedValue={setSelectedFolder}
    />
  );
};

export default FolderSelect;
