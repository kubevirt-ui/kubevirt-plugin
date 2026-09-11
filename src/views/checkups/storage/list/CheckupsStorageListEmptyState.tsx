import type { FC } from 'react';
import { useState } from 'react';

import type { IoK8sApiRbacV1ClusterRoleBinding } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import useClusterParam from '@multicluster/hooks/useClusterParam';

import CheckupsEmptyState from '../../components/CheckupsEmptyState/CheckupsEmptyState';
import { CHECKUP_URLS } from '../../utils/constants';
import { installOrRemoveCheckupsStoragePermissions } from '../utils/utils';

type CheckupsStorageListEmptyStateProps = {
  clusterRoleBinding: IoK8sApiRbacV1ClusterRoleBinding;
  isPermitted: boolean;
  isPermittedToInstall: boolean;
  loadingPermissions: boolean;
};

const CheckupsStorageListEmptyState: FC<CheckupsStorageListEmptyStateProps> = ({
  clusterRoleBinding,
  isPermitted,
  isPermittedToInstall,
  loadingPermissions,
}) => {
  const namespace = useActiveNamespace();
  const cluster = useClusterParam();
  const [isLoading, setIsLoading] = useState<boolean>();

  return (
    <CheckupsEmptyState
      checkupType={CHECKUP_URLS.STORAGE}
      isLoading={isLoading || loadingPermissions}
      isPermitted={isPermitted}
      namespace={namespace}
      permissionsButtonProps={{
        isDisabled: !isPermittedToInstall,
        onClick: async () => {
          setIsLoading(true);
          try {
            await installOrRemoveCheckupsStoragePermissions(
              namespace,
              cluster,
              isPermitted,
              clusterRoleBinding,
            );
          } finally {
            setIsLoading(false);
          }
        },
      }}
    />
  );
};

export default CheckupsStorageListEmptyState;
