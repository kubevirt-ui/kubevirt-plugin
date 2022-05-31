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
      props: { className: 'pf-m-width-20' },
    },
    {
      title: t('Workload'),
      id: 'workload',
      props: { className: 'pf-m-width-10' },
    },
    {
      title: t('Boot source'),
      id: 'source',
    },
    {
      title: t('CPU | Memory'),
      id: 'cpu',
      props: { className: 'pf-m-width-30' },
    },
  ];
};

export default useTemplatesCatalogColumns;
