import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ARCHITECTURE_ID,
  ARCHITECTURE_LABEL,
  ARCHITECTURE_TITLE,
} from '@kubevirt-utils/utils/architecture';
import { K8sResourceCommon, TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

const useTemplatesCatalogColumns = (): TableColumn<K8sResourceCommon>[] => {
  const { t } = useKubevirtTranslation();

  return [
    {
      id: 'name',
      props: { className: 'pf-m-width-40' },
      sort: 'metadata.name',
      title: t('Name'),
      transforms: [sortable],
    },
    {
      id: ARCHITECTURE_ID,
      props: { className: 'pf-m-width-10' },
      sort: `metadata.labels.[${ARCHITECTURE_LABEL}]`,
      title: ARCHITECTURE_TITLE,
      transforms: [sortable],
    },
    {
      id: 'workload',
      props: { className: 'pf-m-width-10' },
      title: t('Workload'),
    },
    {
      id: 'source',
      title: t('Boot source'),
    },
    {
      id: 'cpu',
      props: { className: 'pf-m-width-20' },
      title: t('CPU | Memory'),
    },
  ];
};

export default useTemplatesCatalogColumns;
