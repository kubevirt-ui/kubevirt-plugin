import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon, TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

const useTemplatesCatalogColumns = (): TableColumn<K8sResourceCommon>[] => {
  const { t } = useKubevirtTranslation();

  return [
    {
      title: t('Name'),
      id: 'name',
      transforms: [sortable],
      sort: 'metadata.name',
    },
    {
      title: t('Boot source'),
      id: 'source',
    },
    {
      title: t('Workload'),
      id: 'workload',
    },
    {
      title: t('Boot source'),
      id: 'availability',
    },
    {
      title: t('CPU | Memory'),
      id: 'cpu',
    },
  ];
};

export default useTemplatesCatalogColumns;
