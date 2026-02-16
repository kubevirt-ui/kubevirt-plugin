import React, { FC, useMemo } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { generateRows, useDataViewTableSort } from '@kubevirt-utils/hooks/useDataViewTableSort';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';
import { DataViewTable } from '@patternfly/react-data-view';

import useGuestOS from '../../../../hooks/useGuestOS';

import { getFileSystemColumns, getFileSystemRowId } from './fileSystemTableDefinition';
import FileSystemTableTitle from './FileSystemTableTitle';

type FileSystemTableProps = {
  vmi: V1VirtualMachineInstance;
};

const FileSystemTable: FC<FileSystemTableProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const [data, loaded, loadingError] = useGuestOS(vmi);
  const fileSystems = data?.fsInfo?.disks || [];

  const columns = useMemo(() => getFileSystemColumns(t), [t]);
  const { sortedData, tableColumns } = useDataViewTableSort(fileSystems, columns, 'diskName');

  const rows = useMemo(
    () => generateRows(sortedData, columns, undefined, getFileSystemRowId),
    [sortedData, columns],
  );

  if (!loaded) {
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );
  }

  if (loadingError) {
    return <div className="pf-v6-u-text-align-center">{t('Error loading file systems')}</div>;
  }

  return (
    <ListPageBody>
      <FileSystemTableTitle />
      {isEmpty(fileSystems) ? (
        <div className="pf-v6-u-text-align-center">{t('No file systems found')}</div>
      ) : (
        <DataViewTable aria-label={t('File systems table')} columns={tableColumns} rows={rows} />
      )}
    </ListPageBody>
  );
};

export default FileSystemTable;
