import type { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { StackItem } from '@patternfly/react-core';
import { FolderIcon, ProjectDiagramIcon } from '@patternfly/react-icons';

import { getFolderDisplayName } from './utils';

type SelectedFolderIndicatorProps = {
  folderName?: string;
};

const SelectedFolderIndicator: FC<SelectedFolderIndicatorProps> = ({ folderName }) => {
  const { t } = useKubevirtTranslation();

  if (folderName === undefined) {
    return null;
  }

  return (
    <StackItem>
      {folderName ? <FolderIcon /> : <ProjectDiagramIcon />}
      <span className="pf-v6-u-ml-sm">{getFolderDisplayName(folderName, t)}</span>
    </StackItem>
  );
};

export default SelectedFolderIndicator;
