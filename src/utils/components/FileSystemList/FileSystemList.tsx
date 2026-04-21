import React, { FC, useMemo } from 'react';

import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import {
  FileSystemData,
  getFileSystemColumns,
  getFileSystemRowId,
} from './fileSystemListDefinition';

type FileSystemListProps = {
  data: FileSystemData[];
  loaded: boolean;
  loadError?: Error;
};

const FileSystemList: FC<FileSystemListProps> = ({ data, loaded, loadError }) => {
  const { t } = useKubevirtTranslation();

  const columns = useMemo(() => getFileSystemColumns(t), [t]);

  return (
    <KubevirtTable<FileSystemData>
      ariaLabel={t('File systems table')}
      columns={columns}
      data={data}
      dataTest="file-system-list"
      getRowId={getFileSystemRowId}
      initialSortKey="diskName"
      loaded={loaded}
      loadError={loadError}
      noDataMsg={t('No file systems found')}
    />
  );
};

export default FileSystemList;
