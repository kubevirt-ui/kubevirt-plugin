import * as React from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import { MigrationPolicyModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';

import MigrationPolicyDetailsNavTitle from './components/MigrationPolicyDetailsNavTitle/MigrationPolicyDetailsNavTitle';
import { useMigrationPolicyTabs } from './hooks/useMigrationPolicyTabs';

const MigrationPolicyDetailsNav: React.FC = () => {
  const cluster = useClusterParam();
  const namespace = useNamespaceParam();
  const { name } = useParams();

  const [mp] = useKubevirtWatchResource<V1alpha1MigrationPolicy>({
    cluster,
    groupVersionKind: MigrationPolicyModelGroupVersionKind,
    name,
    namespace,
  });

  const pages = useMigrationPolicyTabs();
  return (
    <>
      <MigrationPolicyDetailsNavTitle mp={mp} />
      <HorizontalNav pages={pages} resource={mp} />
    </>
  );
};

export default MigrationPolicyDetailsNav;
