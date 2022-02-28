import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { sortable } from '@patternfly/react-table';

const useFileSystemTableColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns = [
    {
      title: t('Name'),
      id: 'diskName',
      transforms: [sortable],
      sort: 'diskName',
    },
    {
      title: t('File System Type'),
      id: 'fileSystemType',
      transforms: [sortable],
      sort: 'fileSystemType',
    },
    {
      title: t('Mount Point'),
      id: 'mountPoint',
      transforms: [sortable],
      sort: 'mountPoint',
    },
    {
      title: t('Total Bytes'),
      id: 'totalBytes',
      transforms: [sortable],
      sort: 'totalBytes',
    },
    {
      title: t('Used Bytes'),
      id: 'usedBytes',
      transforms: [sortable],
      sort: 'usedBytes',
    },
  ];

  return columns;
};

export default useFileSystemTableColumns;
