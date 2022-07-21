import React from 'react';

import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ListPageBody,
  ListPageCreate,
  ListPageHeader,
  useK8sWatchResource,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import MigrationPoliciesRow from './components/MigrationPoliciesRow/MigrationPoliciesRow';
import useMigrationPoliciesListColumns from './hooks/useMigrationPoliciesListColumns';

type MigrationPoliciesListProps = {
  kind: string;
  namespace: string;
};

const MigrationPoliciesList: React.FC<MigrationPoliciesListProps> = ({ kind, namespace }) => {
  const { t } = useKubevirtTranslation();
  const [mps, loaded, loadError] = useK8sWatchResource<V1alpha1MigrationPolicy[]>({
    kind,
    isList: true,
    namespaced: true,
    namespace,
  });

  const columns = useMigrationPoliciesListColumns();

  return (
    <>
      <ListPageHeader title={t('MigrationPolicies')}>
        <ListPageCreate groupVersionKind={kind}>{t('Create MigrationPolicy')}</ListPageCreate>
      </ListPageHeader>
      <ListPageBody>
        <VirtualizedTable<V1alpha1MigrationPolicy>
          data={mps}
          unfilteredData={mps}
          loaded={loaded}
          loadError={loadError}
          columns={columns}
          Row={MigrationPoliciesRow}
          //   EmptyMsg={() => <VirtualMachineEmptyState catalogURL={catalogURL} />}
        />
      </ListPageBody>
    </>
  );
};

export default MigrationPoliciesList;
