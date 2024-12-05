import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import SelectTypeahead from '../SelectTypeahead/SelectTypeahead';
import { getCreateNewFolderOption } from '../SelectTypeahead/utils/utils';

import useFolderOptions from './hooks/useFolderOptions';

type FoldersSelectProps = {
  isFullWidth?: boolean;
  namespace: string;
  selectedFolder: string;
  setSelectedFolder: (newFolder: string) => void;
};
const FolderSelect: FC<FoldersSelectProps> = ({
  isFullWidth = false,
  namespace,
  selectedFolder,
  setSelectedFolder,
}) => {
  const { t } = useKubevirtTranslation();
  const [folderOptions, setFolderOptions] = useFolderOptions(namespace);

  return (
    <SelectTypeahead
      canCreate
      dataTestId="vm-folder-select"
      getCreateOption={(inputValue, canCreate) => getCreateNewFolderOption(inputValue, canCreate)}
      initialOptions={folderOptions}
      isFullWidth={isFullWidth}
      placeholder={t('Search folder')}
      selected={selectedFolder}
      setInitialOptions={setFolderOptions}
      setSelected={setSelectedFolder}
    />
  );
};

export default FolderSelect;
