import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import SelectTypeahead from '../SelectTypeahead/SelectTypeahead';

import useFolderOptions from './hooks/useFolderOptions';
import { createNewFolderOption, getCreateNewFolderOption } from './utils/options';
import { getCreationNotAllowedMessage, getToggleStatus } from './utils/validation';

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
      createNewOption={createNewFolderOption}
      dataTestId="vm-folder-select"
      getCreateOption={getCreateNewFolderOption}
      getCreationNotAllowedMessage={getCreationNotAllowedMessage}
      getToggleStatus={getToggleStatus}
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
