import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { sortable } from '@patternfly/react-table';

const useFilesystemTableColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns = [
    {
      title: t('Name'),
      id: 'diskName',
      transforms: [sortable],
      sort: 'diskName',
    },
    {
      title: t('File system type'),
      id: 'fileSystemType',
      transforms: [sortable],
      sort: 'fileSystemType',
    },
    {
      title: t('Mount point'),
      id: 'mountPoint',
      transforms: [sortable],
      sort: 'mountPoint',
    },
    {
      title: t('Total bytes'),
      id: 'totalBytes',
      transforms: [sortable],
      sort: 'totalBytes',
    },
    {
      title: t('Used bytes'),
      id: 'usedBytes',
      transforms: [sortable],
      sort: 'usedBytes',
    },
  ];

  return columns;
};

export default useFilesystemTableColumns;
