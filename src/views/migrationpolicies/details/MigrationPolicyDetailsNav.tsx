import * as React from 'react';

import { MigrationPolicyModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { HorizontalNav, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import MigrationPolicyDetailsNavTitle from './components/MigrationPolicyDetailsNavTitle/MigrationPolicyDetailsNavTitle';
import { useMigrationPolicyTabs } from './hooks/useMigrationPolicyTabs';
export type MigrationPolicyDetailsNavProps = {
  name: string;
  namespace: string;
};

const MigrationPolicyDetailsNav: React.FC<MigrationPolicyDetailsNavProps> = ({
  name,
  namespace,
}) => {
  const [mp] = useK8sWatchResource<V1alpha1MigrationPolicy>({
    name,
    namespace,
    groupVersionKind: MigrationPolicyModelGroupVersionKind,
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
