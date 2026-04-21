import React, { FC, useMemo, useState } from 'react';

import { IoK8sApiRbacV1ClusterRoleBinding } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { Alert, AlertVariant, EmptyStateActions } from '@patternfly/react-core';

import CheckupsEmptyState from '../../components/CheckupsEmptyState/CheckupsEmptyState';
import { CHECKUP_URLS } from '../../utils/constants';
import { useAllRunningSelfValidationJobs } from '../components/hooks/useAllRunningSelfValidationJobs';
import { installSelfValidationPermissions, removeSelfValidationPermissions } from '../utils';
import { getRunningCheckupErrorMessage } from '../utils/selfValidationMessages';

import './CheckupsSelfValidationListEmptyState.scss';

type CheckupsSelfValidationListEmptyStateProps = {
  clusterRoleBinding: IoK8sApiRbacV1ClusterRoleBinding;
  isPermitted: boolean;
  isPermittedToInstall: boolean;
  loadingPermissions: boolean;
};

const CheckupsSelfValidationListEmptyState: FC<CheckupsSelfValidationListEmptyStateProps> = ({
  clusterRoleBinding: _clusterRoleBinding,
  isPermitted,
  isPermittedToInstall,
  loadingPermissions,
}) => {
  const { t } = useKubevirtTranslation();
  const namespace = useActiveNamespace();
  const cluster = useClusterParam();
  const [isLoading, setIsLoading] = useState<boolean>();
  const [error, setError] = useState<null | string>(null);
  const [runningSelfValidationJobs] = useAllRunningSelfValidationJobs();

  const hasRunningSelfValidationJobs = useMemo(
    () => runningSelfValidationJobs && runningSelfValidationJobs.length > 0,
    [runningSelfValidationJobs],
  );

  return (
    <CheckupsEmptyState
      permissionsButtonProps={{
        isDisabled: !isPermittedToInstall,
        onClick: async () => {
          setError(null);
          setIsLoading(true);
          const result = isPermitted
            ? await removeSelfValidationPermissions(namespace, cluster, t)
            : await installSelfValidationPermissions(namespace, cluster, t);
          if (!result.success && result.error) {
            setError(result.error);
          }
          setIsLoading(false);
        },
      }}
      topFooterActions={
        <>
          {error && (
            <EmptyStateActions>
              <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
                {error}
              </Alert>
            </EmptyStateActions>
          )}
          {hasRunningSelfValidationJobs && isPermitted && (
            <EmptyStateActions>
              <Alert
                isInline
                title={t('You can only run a single self validation checkup at a time.')}
                variant={AlertVariant.danger}
              >
                {getRunningCheckupErrorMessage(t, runningSelfValidationJobs || [])}
              </Alert>
            </EmptyStateActions>
          )}
        </>
      }
      checkupType={CHECKUP_URLS.SELF_VALIDATION}
      isLoading={isLoading || loadingPermissions}
      isPermitted={isPermitted}
      namespace={namespace}
    />
  );
};

export default CheckupsSelfValidationListEmptyState;
