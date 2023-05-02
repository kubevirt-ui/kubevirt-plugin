import { modelToRef, TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { K8sResourceCommon, TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

const useVirtualMachineTemplatesColumns = (
  namespace: string,
): [TableColumn<K8sResourceCommon>[], TableColumn<K8sResourceCommon>[]] => {
  const { t } = useKubevirtTranslation();

  const columns = [
    {
      title: t('Name'),
      id: 'name',
      transforms: [sortable],
      sort: 'metadata.name',
      props: { className: 'pf-m-width-30' },
    },
    ...(!namespace
      ? [
          {
            title: t('Namespace'),
            id: 'namespace',
            transforms: [sortable],
            sort: 'metadata.namespace',
          },
        ]
      : []),
    {
      title: t('Workload profile'),
      id: 'workload',
      transforms: [sortable],
      sort: 'objects[0].spec.template.metadata.annotations.["vm.kubevirt.io/workload"]',
      props: { className: 'pf-m-width-15' },
    },
    {
      title: t('Boot source'),
      id: 'availability',
      props: { className: 'pf-m-width-30' },
    },
    {
      title: t('CPU | Memory'),
      id: 'cpu',
      additional: true,
    },
    {
      title: '',
      id: '',
      props: { className: 'dropdown-kebab-pf pf-c-table__action' },
    },
  ];

  const [activeColumns] = useKubevirtUserSettingsTableColumns<K8sResourceCommon>({
    columns,
    columnManagementID: modelToRef(TemplateModel),
  });

  return [columns, activeColumns];
};

export default useVirtualMachineTemplatesColumns;
