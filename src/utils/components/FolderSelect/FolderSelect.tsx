import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import useFolderOptions from './hooks/useFolderOptions';
import SelectTypeahead from './SelectTypeahead';

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
